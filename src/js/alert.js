document.querySelector(".title").textContent = "The text from alert.js";

const message = () => {
  console.log("The Javascript file was transpiled to ES5!");
};

message();

(function () {
  const arr = [1,2,3,4];
  arr.forEach((item) => {
    console.log(item);
  });
  const mappingData = arr.map((item) => {
    return (item / 2);
  });
  console.log(mappingData);

}());
