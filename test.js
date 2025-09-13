const a = 10

console.log('A have ' + a)  //1

Promise.resolve('promise me').then(console.log) //6

process.nextTick(() => {
    console.log('nextTike no log'), //3
        process.nextTick(() => console.log('nextTike1')) //5
})


setTimeout(() => {
    console.log("setTimeout"); //8
}, 0);

setImmediate(() => {
    console.log('setImmediate');//9
});

console.log('hi') //2

process.nextTick(() => console.log('nextTike outside')) //4

Promise.resolve('always promise to your 😂').then(console.log)//7