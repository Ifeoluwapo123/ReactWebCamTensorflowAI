import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import Webcam from "react-webcam";
import { drawMesh } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const snap = useRef(null);
  const reCapture = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [imageCaptured, setImgCaptured] = useState(false);
  const [webcam, setWebcam] = useState(true);

  const runFacemesh = async () => {
    const net = await facemesh.load(
      facemesh.SupportedPackages.mediapipeFacemesh
    );
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const face = await net.estimateFaces({ input: video });

      // Get canvas context
      const ctx = canvasRef.current.getContext("2d");
      setFaceDetected(face.length !== 0);
      // requestAnimationFrame(()=>{drawMesh(face, ctx)});
    }
  };

  useEffect(() => {
    runFacemesh();
  }, []);

  const discardImage = () => {
    setWebcam((prev) => !prev);
    reCapture.current.style.display = "none";
    snap.current.style.display = "";
  };

  const onCaptureHandler = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    imageRef.current.style.display = "";
    reCapture.current.style.display = "";
    snap.current.style.display = "none";
    imageRef.current.setAttribute("src", imageSrc);
    setWebcam((prev) => !prev);
    setImgCaptured(true);
  }, [webcamRef]);

  const convertToFile = async () => {
    const fileName = "photo" + Date.now() + ".png";
    const res = await fetch(imageRef.current.src);
    const blob = await res.blob();

    console.log(new File([blob], fileName, { type: "image/png" }));
  };

  return (
    <div className="App">
      <button
        disabled={!faceDetected}
        ref={snap}
        onClick={onCaptureHandler}
        style={{ backgroundColor: "#fff", width: "319px", height: "60px" }}
      >
        Capture
      </button>
      <button
        ref={reCapture}
        style={{
          backgroundColor: "#fff",
          width: "319px",
          height: "60px",
          display: "none",
        }}
        onClick={discardImage}
      >
        Recapture
      </button>
      <button
        disabled={!imageCaptured}
        style={{
          backgroundColor: "#fff",
          width: "319px",
          height: "60px",
        }}
        onClick={convertToFile}
      >
        Done
      </button>
      <header className="App-header">
        <img
          ref={imageRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
            display: "none",
          }}
        />
        {webcam ? (
          <Webcam
            ref={webcamRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 9,
              width: 640,
              height: 480,
            }}
          />
        ) : (
          <></>
        )}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
