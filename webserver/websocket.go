package webserver

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/mzyy94/nscon"
)

var upgrader = websocket.Upgrader{}
var controller *nscon.Controller

func controllerHandler(w http.ResponseWriter, r *http.Request) {
	// TODO range and check
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	// TODO check compat
	c, err := upgrader.Upgrade(w, r, http.Header{
		"Sec-websocket-Protocol": websocket.Subprotocols(r),
	})
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer c.Close()

	defer controller.Close()
	err = controller.Connect()
	if err != nil {
		log.Println("Controller connect error:", err)
		return
	}

	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			switch e := err.(type) {
			case *websocket.CloseError:
				log.Println("WebSocket closed:", e.Code)
			default:
				log.Println("WebSocket read error:", e)
			}
			break
		}
		err = json.Unmarshal(message, &controller.Input)
		if err != nil {
			log.Println("Unmarshal failed:", err)
		}
	}
}
