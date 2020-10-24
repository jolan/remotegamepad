package main

import (
	"flag"

	"github.com/jolan/remotegamepad/webserver"
	"github.com/mzyy94/nscon"
)

func main() {
	var (
		device = flag.String("device", "/dev/hidg0", "simulating hid gadget path")
	)
	flag.Parse()

	controller := nscon.NewController(*device)

	webserver.StartHTTPServer(controller)
}
