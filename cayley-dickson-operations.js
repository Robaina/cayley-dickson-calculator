/* Operate with Cayley-Dickson algebras in JavaScript */
let colors = ["rgb(94, 217, 69)", "rgb(250, 198, 44)", "rgb(246, 113, 71)",
              "rgb(51, 215, 201)", "rgb(217, 69, 189)", "rgb(71, 114, 241)",
              "rgb(132, 22, 242)"];
let trail_color = colors[Math.floor(Math.random() * colors.length)];
document.body.style.setProperty("--fancyColor", trail_color);

// Avoid reloading page on submit
let form = document.getElementById("myForm");
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);

Array.prototype.add = function(other) {
  let result = [];
  for (let i=0; i<this.length; i++) {
    result.push(this[i] + other[i])
  }
  return result
}
Array.prototype.subtract = function(other) {
  let result = [];
  for (let i=0; i<this.length; i++) {
    result.push(this[i] - other[i])
  }
  return result
}

function conjugate(z) {
  /* Compute conjugate of Cayley-Dickson number.
     Takes array of coefficients
  */
  let z_star = [...z];
  for (let i=1; i<z.length; i++) {
    z_star[i] *= -1;
  }
  return z_star
}

function invert(z) {
  /* Compute inverse of Cayley-Dickson number.
     Takes array of coefficients
  */
  let z_inv = [];
  let z_star = conjugate(z);
  let z_norm = z.map(a => a**2).reduce((a, b) => a + b);
  for (let a of z_star) {
    z_inv.push(a / z_norm);
  }
  return z_inv;
}

function multiplyCayleyDickson(w, z) {
  /* Multiply two Cayley-Dickson numbers
     where w, z are arrays containing the
     coefficients
  */
  let n = z.length;
  if (n === 1) {
    return [w.pop() * z.pop()]
  }

  let m = Math.floor(n / 2);
  let a = w.slice(0, m);
  let b = w.slice(m, n);
  let c = z.slice(0, m);
  let d = z.slice(m, n);
  let ap = [...a];
  let bp = [...b];
  let cp = [...c];
  let dp = [...d];

  return multiplyCayleyDickson(a, c).subtract(
    multiplyCayleyDickson(conjugate(d), b)).concat(
      multiplyCayleyDickson(dp, ap).add(
        multiplyCayleyDickson(bp, conjugate(cp)))
    );

}

Number.prototype.countDecimals = function () {
  if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
  return this.toString().split(".")[1].length || 0;
}

// Bartok: 6 romanian dances for violin and piano => good stuff
class CayleyDicksonNumber {

  constructor(number=[], units=[]) {

    if (typeof number === "string") {
      let parsed_number = this.parseNumberString(number);
      number = parsed_number.coeffs;
      units = parsed_number.units;
    }

    let dim = number.length > 0 ? number.length : units.length;

    if (number.length < 1) {
      for (let i=0; i<dim; i++) {
        number.push(0);
      }
      number[0] = 1;
    }

    if (units.length < 1) {
      for (let i=0; i<dim;i++) {
        this[`e_${i}`] = number[i];
      }
    } else {
      for (let i=0; i<dim;i++) {
        this[units[i]] = number[i];
      }
    }

  }

  add(other) {
    let result = new CayleyDicksonNumber([], this.getUnits());
    for (let field in this) {
      result[field] =  this[field] + other[field];
    }
    return result
  }

  subtract(other) {
    let result = new CayleyDicksonNumber([], this.getUnits());
    for (let field in this) {
      result[field] =  this[field] - other[field];
    }
    return result
  }

  multiply(other) {
    let result = new CayleyDicksonNumber([], this.getUnits());
    let w = this.getCoeffs();
    let z = other.getCoeffs();
    let result_coeffs = multiplyCayleyDickson(w, z);
    let i = 0;
    for (let field in this) {
      result[field] = result_coeffs[i];
      i++;
    }
    return result
  }

  divide(other) {
    let result = new CayleyDicksonNumber([], this.getUnits());
    let w = this.getCoeffs();
    let z = invert(other.getCoeffs());
    let result_coeffs = multiplyCayleyDickson(w, z);
    let i = 0;
    for (let field in this) {
      result[field] = result_coeffs[i];
      i++;
    }
    return result
  }

  parseNumberString(number_str) {

    let letter = /[a-z]/gi;
    let is_real_number = number_str.match(letter) === null? true: false;

    function parseRealNumber() {
      return {"coeffs": [parseFloat(number_str)], "units": [""]}
    }

    function parseNonRealNumber() {
      let sign = /[+-]/gi;
      let digit = /[0-9.]/g;
      let units = [];
      let values = [];
      let signs = number_str.match(sign);
      let components = number_str.split(sign);
      if (signs.length < components.length && components[0] !== "") {
        signs.unshift("+");
      }
      let n = 0;
      for (let component of components) {
        if (component !== "") {
          let unit;
          if (component.match(letter) !== null) {
            unit = component.match(letter).join("");
          } else {
            unit = "";
          }
          let value = parseFloat(signs[n] + component.split(letter)[0].trim());
          units.push(unit);
          values.push(value);
          n++;
        }
      }
      return {"coeffs": values, "units": units}
    }

    if (is_real_number) {
      return parseRealNumber();
    } else {
      return parseNonRealNumber();
    }

  }

  getCoeffs() {
    let number_coeffs = [];
    for (let field in this) {
      number_coeffs.push(this[field]);
    }
    return number_coeffs
  }

  getUnits() {
    let number_units = [];
    for (let field in this) {
      number_units.push(field);
    }
    return number_units
  }

  toString(decimals=null) {
    let sign = "";
    let str = "";
    let coeffs = this.getCoeffs();
    let units = this.getUnits();
    let round = (n, dec) => Math.round(n * 10**dec) / 10**dec;

    for (let i=0; i<coeffs.length; i++) {
      let coeff;
      let sign = coeffs[i] >=0 ? "+": "";
      if (decimals !== null) {
        coeff = round(coeffs[i], decimals);
        let number_decimals = coeff.countDecimals();
        let decimal_diff = decimals - number_decimals;
        if (decimal_diff > 0) {
           if (number_decimals > 0) {
             coeff = coeff + "0".repeat(decimal_diff);
           } else {
             coeff = coeff + "." + "0".repeat(decimal_diff);
           }
        }
      } else {
        coeff = coeffs[i];
      }
      str = str + sign + coeff + units[i];
    }
    if (str[0] === "+") {
      return str.slice(1).replace(/\+/g," + ").replace(/\-/g, " - ")
    } else {
      return str.slice(0, 1) + str.slice(1).replace(/\+/g," + ").replace(/\-/g, " - ")
    }
  }

}


function operateOnCayleyDickson(e) {
  let selected_operation = e.id;
  let result_div = document.getElementById("form-result");
  let number_str_p = document.getElementById("number-p").value;
  let number_str_q = document.getElementById("number-q").value;
  let p = new CayleyDicksonNumber(number_str_p);
  let q = new CayleyDicksonNumber(number_str_q);
  let decimals = 2;
  let result_str = eval(`p.${selected_operation}(q).toString(${decimals})`);
  result_div.innerHTML = `$pq = ${result_str}$`;
  MathJax.Hub.Queue(["Typeset", MathJax.Hub, result_div]);
}

// TODO: Need to enable real input, also autogenerate a complex number when user enters disparate number types, e.g. one real and one quaternion. Also, number of decimals should be selected automatically based on maximum number of decimals set by user, at least as a default feature.
