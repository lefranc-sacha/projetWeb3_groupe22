import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../images/earth-11048_1920.jpg';


function StartPage() {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [gameMode, setGameMode] = useState('names');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  const handleStartGame = () => {
    navigate('/game', { state: { gameMode, numberOfQuestions } });
  };

  const handleTrainingGame = () => {
    navigate('/gameTraining');
  };
  const handleStatisticPage = () => {
    navigate('/statisticPage');
  };


  return (
    <div className="app-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
    <div>

      <h1 className='title'>Welcome to the Country Game</h1>

      <div className="container border border-primary  rounded-4">
        <div className="row ">

          <div className="col">
            <div className="container">
              <div className="row m-3">
                <div className="col">
                  <h5>Training time:</h5>
                </div>
              </div>

              <div className="row m-3">
                <div className="col">
                  <h6>
                    If you just want to train yourself to do a better score, we recommand yo to go here!
                  </h6>
                </div>
              </div>

              <div className="row">
                <div className="col text-center">
                <button type="button" className="btn btn-primary rounded-5" onClick={handleTrainingGame}>Training Game</button>
                </div>
              </div>
            </div>


            <div className="container">
              <div className="row m-3">
                <div className="col">
                  <h5>Statistics:</h5>
                </div>
              </div>

              <div className="row m-3">
                <div className="col">
                  <h6>
                    if you want to find out more about the statistics for the different countries in the world, don&apos;t hesitate to take a look.
                  </h6>
                </div>
              </div>

              <div className="row p-2">
                <div className="col text-center">
                  <button type="button" className="btn btn-primary rounded-5" onClick={handleStatisticPage}>View statistics</button>
                </div>
              </div>
            </div>
          </div>

          



          <div className="col align-self-center">
            <div className="container ">
                <div className="row m-3">
                  <div className="col align-self-center">
                    <h5>
                      Select the number of questions you want to answer:
                    </h5>
                  </div>

                
              </div>

              <div className="row">
                <div className="col">
                <label className="form-label">Number of questions</label>
                  <select className="form-select" id="selectNumbersOfQuestions" value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(Number(e.target.value))}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="row text-center py-3">
                <div className="col">
                  <button type="button" className="btn btn-primary rounded-5" onClick={handleStartGame}>Start Game</button>
                </div>
              </div>

            </div>



          </div>


          </div>
          
        </div>

      </div>

  </div>
  );
};

export default StartPage
