// Semidán Robaina-Estévez, 2020 (hello@semidanrobaina.com)

let colors = ["rgb(94, 217, 69)", "rgb(250, 198, 44)", "rgb(246, 113, 71)",
              "rgb(51, 215, 201)", "rgb(217, 69, 189)", "rgb(71, 114, 241)",
              "rgb(132, 22, 242)"];
let trail_color = colors[Math.floor(Math.random() * colors.length)];
document.body.style.setProperty("--fancyColor", trail_color);

// Avoid reloading page on submit
let form = document.getElementById("myForm");
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);


function typesetInput(e) {
  // MAthjax doesn't have access to input.value
}

function operateOnCayleyDickson(e) {
  let selected_operation = e.id;
  let displayed_operation;

  switch (selected_operation) {
    case "add":
      displayed_operation = "p + q";
      break;
    case "subtract":
      displayed_operation = "p - q";
      break;
    case "multiply":
      displayed_operation = "pq";
      break;
    case "divide":
      displayed_operation = "pq^{-1}";
      break;
    default:
      displayed_operation = "pq";
  }

  let result_div = document.getElementById("form-result");
  let number_str_p = document.getElementById("number-p").value;
  let number_str_q = document.getElementById("number-q").value;
  let p = new CayleyDicksonNumber(number_str_p);
  let q = new CayleyDicksonNumber(number_str_q);
  let decimals = Math.max(p.getPrecision(), q.getPrecision());

  if (p.isCayleyDickson() && q.isCayleyDickson()) {
    let result_str = eval(`p.${selected_operation}(q).toString(${decimals})`);
    result_div.innerHTML = `$${displayed_operation} = ${result_str}$`;
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, result_div]);
  } else {
    alert("Enter a valid input!")
  }
}
