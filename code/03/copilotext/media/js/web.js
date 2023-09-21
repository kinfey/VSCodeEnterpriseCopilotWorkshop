(function () {

    // @ts-ignore
    window.addEventListener("message", (event) => {
        const message = event.data;
        console.log(message);
        switch (message.type) {
          case "addQA": {
            const divTag = document.createElement('div');
            const brTag = document.createElement('br');
            divTag.innerHTML = message.value;
            // divTag.innerHTML += '🤖: <br/><br/> '  + message.value + message.value + '<br/><br/>';
            document.getElementById("answer").appendChild(divTag).appendChild(brTag);
            document.getElementById("taAsk").value = "";
            break;
          }
          case "addCode": {
            // @ts-ignore
            const divTag = document.createElement('code');
            const brTag = document.createElement('br');
            divTag.innerHTML = message.value;
            // @ts-ignore
            document.getElementById("answer").appendChild(divTag).appendChild(brTag);
            break;
          }
        }
    });


})();




