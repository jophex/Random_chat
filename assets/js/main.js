document.addEventListener("DOMContentLoaded", () => {
//   const APP_ID = "5ab0265f0d524dfd81c420403c5a4a3f";
    const APP_ID = "b52f4ae477094c20beef7f8175c91ab1";
//   const TEMP_ID =
//     "007eJxTYNie8sx741Wn361RC84HtM2aoHSi4sHVs8t2qSw6eK3v4sIvCgymiUkGRmamaQYppkYmKWkpFobJJkYGJgbGyaaJJonGaa8cT6U0BDIybNbyYWRkgEAQn4UhNzEzj4EBAKRGI68=";
    const TEMP_ID= "007eJxTYDDW+Hb2ypVlty+s6Q6Wlo3/lPJnxkLT1c9eC7HGzlt7+lSaAkOSqVGaSWKqibm5gaVJspFBUmpqmnmahaG5abKlYWKS4cujF1IaAhkZ9IveMzIyQCCIz8GQnJFYUpSfn8vAAADgziTh";
//   const CHANNEL_NAME = "main";
    const CHANNEL_NAME = "chatroom"


  const username = document.getElementById("Name");
  const Button = document.getElementById("join");
  const display_name = document.getElementById("display_name");

  const videostream = document.querySelector(".video-streams");
  const stream_control = document.querySelector(".stream-controls");
  const streamWrapper = document.getElementById("stream-wrapper");

  Button.addEventListener("click", () => {
    const usernamevalue = username.value.trim();

    if (usernamevalue === "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        footer: '<a href="">Why do I have this issue?</a>',
      });
    } else {
    //   Swal.fire(
    //     `Hello ${usernamevalue}!`,
    //     "You clicked the button!",
    //     "success"
    //   );


        // username.style.display = "none"
    //   Button.style.display = "none"

      const agoraEngine = AgoraRTC.createClient({ mode: "rtc", codec: "vp9" });

      let localTracks = [];
      let remoteUsers = {};

      let JoinandDisplayLocalUser = async () => {

        agoraEngine.on("user-published", handleUserJoined)
        agoraEngine.on("user-left", handleUserLeft)
        agoraEngine.on("")


        let UID = await agoraEngine.join(APP_ID, CHANNEL_NAME, TEMP_ID, null);

        localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

        let player = `<div class="video-container" id="user-container-${UID}">
                <div class="video-player" id="user-${UID}"></div> 
              </div>`;

        videostream.insertAdjacentHTML("beforeend", player);

        localTracks[1].play(`user-${UID}`);

        await agoraEngine.publish([localTracks[0], localTracks[1]]);
      };

      let joinstream = async () => {
        await JoinandDisplayLocalUser();
        Button.style.display = "none";
        stream_control.style.display = "flex";
      };
      Button.addEventListener("click", joinstream);

      let handleUserJoined = async(user, mediaType) => {
            remoteUsers[user.UID] = user
            await agoraEngine.subscribe(user, mediaType);

            if(mediaType === 'video'){
                let player = document.getElementById(`user-container-${user.UID}`)
                if(player != null){
                    player.remove()
                }

                player = `<div class="video-container" id="user-container-${user.UID}">
                    <div class="video-player" id="user-${user.UID}"></div>
                
                </div>`

                videostream.insertAdjacentHTML('beforeend', player)
                user.videoTrack.play(`user-${user.UID}`)
            }

            if(mediaType === 'audio'){
                user.audioTrack.play()

            }
        }
    
    
    let handleUserLeft = async(user) => {
        delete remoteUsers[user.UID]
        document.getElementById(`user-container-${user.UID}`).remove()
    }

    let leaveAndRemoveLocalStream = async () => {
        if (localTracks.videoTrack) {
          localTracks.stop();
          localTracks.close();
          localTracks.videoTrack = null;
        }
      
        if (localTracks.audioTrack) {
          localTracks.stop();
          localTracks.close();
          localTracks.audioTrack = null;
        }
      
        await agoraEngine.leave();
        Button.style.display = "block";
        stream_control.style.display = "none";
        videostream.innerHTML = "";
      };
      
      let toggleMic = async (e) => {
        if(localTracks[0].audioTrack.muted()){
            await localTracks[0].setMuted(false)
            e.target.innerHTML = 'Mic on'

        }else{
            await localTracks[0].setMuted(true)
            e.target.innerHTML = "Mic off"
            e.target.style.backgroundColor = '#EE4B2B'
        }


        let toggleCamera = async(e) =>{
            if(localTracks[1].muted){
                await localTracks[1].setMuted(false)
                e.target.innerHTML = "Camera On"
                e.target.style.backgroundColor = 'cadetblue'

            }else{
                await localTracks[1].setMuted(true)
                e.innerHTML = "Camera Off"
                e.target.style.backgroundColor = '#EE4B2B'
            }

        }




      }





      document.querySelector(".leave-btn").addEventListener("click", leaveAndRemoveLocalStream);
      document.getElementById('mic-btn').addEventListener("click", toggleMic)
      document.getElementById('camera-btn').addEventListener("click", toggleCamera)

    





    }
  });
});
