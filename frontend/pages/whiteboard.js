import React, { useRef, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const Whiteboard = ({ roomId }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    ctxRef.current = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    socket.on("draw", ({ x, y }) => {
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
    });

    return () => {
      socket.off("draw");
    };
  }, []);

  const handleDraw = (event) => {
    const { clientX: x, clientY: y } = event;
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();

    socket.emit("draw", { roomId, x, y });
  };

  return <canvas ref={canvasRef} onMouseMove={handleDraw} />;
};

export default Whiteboard;
