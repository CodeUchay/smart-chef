// src/components/DateScanner.js
import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';

const DateScanner = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [scannedDate, setScannedDate] = useState('');
  const [textExtracted, setTextExtracted] = useState('');

  // camera front or back
  const [cameraMode, setCameraMode] = useState('user');
  const videoConstraints = {
    facingMode: cameraMode
  };

  function toggleCamera(){
    if (cameraMode !== 'user' ){
      setCameraMode('user')
    }
    else {
      setCameraMode({ exact: "environment" })
    }
  }
  const webcamRef = React.createRef();
  const worker = createWorker({
    logger: m => console.log(m)
  });
  const captureImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const webpImage = new Image();
    
    webpImage.onload = () => {
      canvas.width = webpImage.width;
      canvas.height = webpImage.height;
      context.drawImage(webpImage, 0, 0, webpImage.width, webpImage.height);
      
      // Convert the canvas content to a PNG Data URL
      const pngDataUrl = canvas.toDataURL('image/png');
  
      // Pass the PNG Data URL to Tesseract for recognition
      recognizeTextInImage(pngDataUrl);
    };
  
    webpImage.src = imageSrc;
  };
  
  const recognizeTextInImage = async (imageSrc) => {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
  
    const { data: { text } } = await worker.recognize(imageSrc);
    console.log(text);
    setTextExtracted(text);
    const dateRegex = /\d{2}\/\d{2}\/\d{4}/; // Customize this regex for your date format

    const extractedDate = text.match(dateRegex);
    setScannedDate(extractedDate);
  
    await worker.terminate();
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setCapturedImage(reader.result);
    };

    reader.readAsDataURL(file);
  };
  return (
    <div className='bg-slate-700 rounded-xl '>
      <h1 className='text-center text-white font-sans text-xl p-3'>Date Scanner</h1>
      {capturedImage ? (
        <>
          <img src={capturedImage} className='h-80 w-100' alt="Captured" />
          {textExtracted && <p className='text-white p-4'>Extracted Text: {textExtracted}
          </p>}
          {scannedDate && <p className='text-white p-4'>Extracted Date: {scannedDate}
          </p>}
        </>
      ) : (
        <div>
          <Webcam ref={webcamRef} videoConstraints={videoConstraints} className='border max-w-xs m-3 border-slate-500 rounded-xl'/>
          <div> <div className="mb-4 flex flex-col">
           <div className='flex flex-row justify-between'> 
          <button onClick={captureImage} className='m-2  bg-slate-200 rounded px-3 py-2'>Capture Image</button>
          <button onClick={toggleCamera} className='m-2  bg-slate-200 rounded px-2 py-2'>Turn Camera</button>
          </div> <span className='text-white text-center font-semibold'>OR</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="m-3 w-64 bg-slate-200 rounded"
        />
      </div></div>
          </div>
      )}
    </div>
  );
};

export default DateScanner;
