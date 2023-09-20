(function () {

    // @ts-ignore
    window.addEventListener("message", (event) => {
        const message = event.data;
        console.log(message);
        switch (message.type) {
          case "addQA": {
            const divTag = document.createElement('div');
            const brTag = document.createElement('br');
            divTag.innerHTML = '🧑:  <br/><br/> ' + document.getElementById('taAsk').value + '<br/><br/>';
            divTag.innerHTML += '🤖: <br/><br/> '  + document.getElementById('taAsk').value + '<br/><br/>';
            document.getElementById("answer").appendChild(divTag).appendChild(brTag);
            break;
          }
        }
    });


})();




