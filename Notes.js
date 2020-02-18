//  function myFunc(arg) {
//     console.log(`arg was => ${arg}`);
//   }
  
//   setTimeout(myFunc, 1500, 'funky');

// function intervalFunc() {
//     console.log('Cant stop me now!');
//   }
  
//   setInterval(intervalFunc, 10000);

// const timeoutObj = setTimeout(() => {
//     console.log('timeout beyond time');
//   }, 1500);
  
  const immediateObj = setImmediate(() => {
    console.log('immediately executing immediate');
  });
  
//   const intervalObj = setInterval(() => {
//     console.log('interviewing the interval');
//   }, 500);
  
//   clearTimeout(timeoutObj);
//   clearImmediate(immediateObj);
//   clearInterval(intervalObj);