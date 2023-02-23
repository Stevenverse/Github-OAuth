import './App.css';
import { useEffect, useState } from 'react';

const CLIENT_ID = "1ae3e0de7d70a65589dd";

function App() {
  const [rerender, setRerender] = useState(false);
  const [userData, setUserData] = useState({})
  // Forward the user to the github login screen (we pass in the client ID)
  // user is now on the github side and logs in (github.com/login)
  // when user decides to login... they get forwarded back to localhost:3000
  // BUT localhost:3000/?code=ADFDJKDFNFJSFM
  // use the code to get the access token (code can only be used once)

  useEffect(() => {
    // localhost:3000/?code=ADFDJKDFNFJSFM
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");
    console.log(codeParam);

    if(codeParam && (localStorage.getItem("accessToken") === null )){
      async function getAccessToken(){
        await fetch("http://localhost:4000/getAccessToken?code=" + codeParam, {
          method: "GET"
        }).then((response) => {
          return response.json();
        }).then((data) => {
          if(data.access_token){
            localStorage.setItem("accessToken", data.access_token);
            setRerender(!rerender);
          }
        })
      }
      getAccessToken();
    }
  }, []);

  async function getUserData(){
    await fetch("http://localhost:4000/getUserData", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("accessToken") // Bearer ACCESSTOKEN
      }
    }).then((response) => {
      return response.json();
    }).then((data) => {
      console.log(data);
      setUserData(data);
    })
  }
 
  
  function loginWithGithub(){
    window.location.assign("https://github.com/login/oauth/authorize?client_id=" +  CLIENT_ID);
  }
  return (
    <div className="App">
      <header className="App-header">
        {localStorage.getItem("accessToken") ?
        <>
          <h1>We have the Access Token</h1>
          <button onClick={() => {localStorage.removeItem("accessToken"); setRerender(!rerender);}}>
            Log Out
          </button>
          <h3>Get User Data from Github API</h3>
          <button onClick={getUserData}>Get Data</button>
          {Object.keys(userData).length !== 0 ?
            <>
              <h4>Hey there {userData.login}</h4>
              <img width="100px" height="100px" src={userData.avatar_url} alt='github profile pic' />
              <a href={userData.html_url}>Link to the Github profile</a>
            </>
            :
            <>
            </>
          }
        </>
        :
        <>
          <h3>User is not logged in</h3>
          <button onClick={loginWithGithub}>
            Login with Github
          </button>
        </>
        }
        
      </header>
    </div>
  );
}

export default App;
