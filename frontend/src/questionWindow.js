// QuestionWindow.js
import React ,{useState, useEffect, use} from "react";
import axios from "axios";

function QuestionWindow({ onAnswerSelected }) { // Prop to handle answer selection and lead to chat

  const [getData, setGetData] = useState([]);
  const [setId, setSetId] = useState("");

  useEffect(() => {
    // Fetch data from the API when the component mounts
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/sys", {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // Allow CORS for local development
          }
        });
        setGetData(response.data);
        const item = response.data.find(item => item.id === setId);
        console.log(item); // This will print the whole object with all its properties
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  })

  const handleAnswerSelected = async (answer) => {
    try {
      // Send the selected answer to the backend
      await axios.post("http://localhost:5000/answer", {
        answer: answer,
        setId: setId, // Include the setId if needed
      }, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // Allow CORS for local development
        }
      });
      // Handle the answer selection logic here
      console.log("Selected answer:", answer);
      onAnswerSelected(); // Call the prop function to proceed to chat
    } catch (error) {
      console.error("Error sending answer:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 text-center">
      <h1 className="text-4xl font-bold italic mb-6">Who are you?</h1> {/* Title for the question screen */}
      <p className="text-lg mb-8 text-gray-700">
        No data will be kept, this question is for improving experience only.
      </p>
      <div className="grid grid-cols-2 gap-6 w-full max-w-md"> {/* Grid for 2x2 buttons */}
        <button
          onClick={() => { setSetId("1"); handleAnswerSelected(); }} // All buttons will lead to the chat for now
          className="px-6 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-black transition duration-600 ease-in-out shadow-md"
        >
          Recruiter
        </button>
        <button
          onClick={() => { setSetId("2"); handleAnswerSelected(); }}
          className="px-6 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-black transition duration-600 ease-in-out shadow-md"
        >
          Developer
        </button>
        <button
          onClick={onAnswerSelected}
          className="px-6 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-black transition duration-600 ease-in-out shadow-md"
        >
          Tester
        </button>
        <button
          onClick={onAnswerSelected}
          className="px-6 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-black transition duration-600 ease-in-out shadow-md"
        >
          A friend of you
        </button>
      </div>
    </div>
  );
}

export default QuestionWindow;