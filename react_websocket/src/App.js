import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [count, setCount] = useState(null);  // Current countdown value
  const [inputValue, setInputValue] = useState('');  // User input for starting number
  const [progress, setProgress] = useState(100);  // Progress bar
  const [initialNumber, setInitialNumber] = useState(null);  // Store initial number for progress calculation
  const socketRef = useRef(null);  // Ref to hold WebSocket instance

  useEffect(() => {
    if (!socketRef.current) return;

    // Handle incoming WebSocket messages
    socketRef.current.onmessage = (event) => {
      const receivedNumber = parseInt(event.data, 10);

      // If the message is a number, update the countdown and progress
      if (!isNaN(receivedNumber)) {
        setCount(receivedNumber);
        if (initialNumber) {
          setProgress((receivedNumber / initialNumber) * 100);  // Update progress
        }
      }

      // When the countdown reaches 0, reset progress and allow a new countdown
      if (receivedNumber === 0) {
        setProgress(0);
        socketRef.current.close(); // Close WebSocket connection when countdown is finished
        socketRef.current = null;  // Set WebSocket to null after closing
        resetCountdown(); // Automatically reset to allow new input
      }
    };

    // Cleanup WebSocket connection when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [initialNumber]);

  // Function to start the countdown
  const startCountdown = () => {
    if (!inputValue) return; // Return if no input value

    const number = parseInt(inputValue, 10);
    setInitialNumber(number); // Store initial number for progress tracking
    setCount(number); // Set initial countdown number
    setProgress(100); // Reset progress bar to 100%

    // Initialize WebSocket connection
    socketRef.current = new WebSocket('ws://localhost:8000/ws');

    // Send the starting number once WebSocket is open
    socketRef.current.onopen = () => {
      socketRef.current.send(inputValue); // Send the starting number to the backend
    };

    setInputValue(''); // Clear the input field
  };

  // Automatically reset everything to allow starting a new countdown
  const resetCountdown = () => {
    setCount(null); // Reset the countdown display
    setInitialNumber(null); // Reset the initial number
    setProgress(100); // Reset the progress bar to 100%
    setInputValue(''); // Clear input value
  };

  return (
    <div className="App">
      <h1>Simple Countdown with Progress Bar</h1>

      {/* Input field to start countdown */}
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter starting number"
        disabled={count !== null && count > 0} // Disable input while countdown is running
      />
      <button onClick={startCountdown} disabled={count !== null && count > 0}>Start Countdown</button>

      {/* Progress bar showing remaining time */}
      {count !== null && (
        <div style={{ marginTop: '20px', width: '100%', backgroundColor: '#ddd' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '30px',
              backgroundColor: 'green',
            }}
          ></div>
        </div>
      )}

      {/* Display the current countdown number */}
      {count !== null && (
        <div>
          <h2>Countdown: {count}</h2>
        </div>
      )}
    </div>
  );
}

export default App;
