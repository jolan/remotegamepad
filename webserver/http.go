package webserver

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/mzyy94/nscon"
)

// StartHTTPServer starts HTTP server
func StartHTTPServer(con *nscon.Controller) {
	controller = con

	r := mux.NewRouter()

	r.HandleFunc("/controller", controllerHandler)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./webroot/")))
	http.Handle("/", r)

	srv := &http.Server{
		Handler:      r,
		Addr:         "0.0.0.0:8085",
		WriteTimeout: 10 * time.Second,
		ReadTimeout:  10 * time.Second,
	}

	log.Println("remotegamepad starting on port 8085")
	log.Fatal(srv.ListenAndServe())
}
