import React from 'react';
import '../../assets/css/classroom.css';

const ClassRoom = () => {
    const openPiPWindow = () => {
        // Create a new window to simulate PiP
        const pipWindow = window.open('', '_blank', 'width=300,height=300,top=100,left=100');

        // HTML content for the PiP window
        pipWindow.document.write(`
            <html>
                <head><title>PiP Window</title></head>
                <body>
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: rgba(255, 255, 255, 0.9);">
                        <h3>This is PiP Content</h3>
                        <p>This content stays visible in the PiP mode even when the browser tab is minimized.</p>
                    </div>
                </body>
            </html>
        `);

        // Close window event listener to keep it active
        pipWindow.onbeforeunload = function () {
            alert("PiP window is closing.");
        };
    };

    return (
        <div className="container">
            <div className="first-column">
                <div className="top-row">
                    <div className="left"></div>
                    <div className="right">
                        <div className="top-half"></div>
                        <div className="bottom-half"></div>
                    </div>
                </div>
            </div>
            <div className="second-column"></div>

            {/* Button to trigger PiP Window */}
            <button onClick={openPiPWindow}>Open PiP Window</button>
        </div>
    );
};

export default ClassRoom;
