function norm_power(n, p) {
  // returns power of p found in n
  if (n == 0) {
    // hopefully shouldnt get here
    return -1;
  }
  var k = 0;
  while (n % p == 0) {
    n = n / p;
    k++;
  }
  return k;
}

function entropy(guess, possibles, prime) {
  dist = {};
  possibles.forEach( function (value) {
    d = norm_power(Math.abs(value - guess), prime)
    if (!dist.hasOwnProperty(d)) dist[d] = 0;
    dist[d] += 1;
  });
  total = Object.values(dist).reduce((a, b) => a + b);
  ans = Object.values(dist).map((a) => Math.log2(total / a) * a / total).reduce((a, b) => a + b);
  return ans;
}

function maximum_entropy(possibles, prime) {
  return Math.max(...Array.from(Array(MAX_NUM).keys()).map((v) => entropy(v, possibles, prime)));
}

function price(possibles, prime) {
  return Math.round(250 * maximum_entropy(possibles, prime));
}

function filter_numbers(guess, clue, prime) {
  numbers_left = numbers_left.filter((number) => norm_power(Math.abs(number - guess), prime) === clue);
}

function guess_helper(guess, prime) {
  var li = document.createElement("li");
  var val = 0;
  var pow = -1;
  if (guess != target) {
    pow = norm_power(Math.abs(guess - target), prime);
    if (pow == 0) {
      val = 1;
    } else {
      val = "1/" + Math.pow(prime, pow);
    }
  }
  spent += parseInt(document.getElementById(prime+"-price").innerHTML.substring(1))
  console.log("spent: "+document.getElementById(prime+"-price").innerHTML.substring(1))
  li.innerHTML = "<span style=\"color: black\">Prime: " + prime + " Guess: " + guess + " Norm: " + val + " Spent: ¥" + spent + "</span>";
  li.style.backgroundColor = get_color(pow);
  share_emojis.push(pow);
  document.getElementById("guesses").appendChild(li);
  if (val != 0) {
    filter_numbers(guess, pow, prime);
    MY_PRIMES.forEach(function (p) {
      document.getElementById(p+"-price").innerHTML = "¥" + price(numbers_left, p);
    });
    return;
  }
  won = (val == 0);

  // Game is over
  var result_string = val == 0 ?
    "You win!" :
    "You lose. Today's number was " + target + ".";
  document.getElementById("button").disabled = true;

  document.getElementById("share-button").style.display = "block";
}

function guess() {
  var p = document.getElementById("prime-input").value;
  var g = document.getElementById("guess-input").value;
  document.getElementById("prime-input").value = "";
  document.getElementById("guess-input").value = "";
  try {
    g = parseInt(g);
    if (isNaN(g) || g < 0 || g > MAX_NUM) { throw "Not a valid guess."; }

    p = parseInt(p);
    if (!MY_PRIMES.includes(p)) { throw "Not a valid prime."; }
  } catch (error) {
    alert(error);
    return;
  }
  guess_helper(g, p);
  var arr = JSON.parse(localStorage.todays_guesses);
  arr.push([g, p]);
  localStorage.todays_guesses = JSON.stringify(arr);
}

function share() {
  // need to make the display date a separate variable because 'today' is used for seeding the random number generation.
  var today_but_not_weird = (nd.getMonth() + 1) + '/' + nd.getDate() + '/' + nd.getFullYear();
  var text = "I solved the " + today_but_not_weird + " Zpordle Shop " + "by spending ¥" + spent + ".\n";
  var emojis = "";
  for (var i = 0; i < share_emojis.length; i++) {
    emojis += emoji_lookup(share_emojis[i]);
    if ((i % 5 == 4) && (i != share_emojis.length - 1)) {
      emojis += "\n";
    }
  }
  text += (emojis + "\n");
  text += "https://tectoskepsis.github.io/zpordle"
  navigator.clipboard.writeText(text).then(function () {
    alert("Copied to clipboard.");
  }, function () {
    alert("Failed to copy. So go do your manifolds you nerd.")
  });
}

function get_color(pow) {
  switch (pow) {
    case -1:
      return '#57b5ff';
    case 0:
      return '#ff0000';
    case 1:
      return '#ff8000';
    case 2:
      return '#ffff00';
    default:
      return '#80ff00';
  }
}

function color_scale(percent) {
  var r = Math.round(Math.min((1 - percent) * 512, 255));
  var g = Math.round(Math.min(percent * 512, 255));
  var b = 0;
  var h = r * 0x10000 + g * 0x100 + b * 0x1;
  return '#' + ('000000' + h.toString(16)).slice(-6);
}

function emoji_lookup(val) {
  if (val in EMOJI_TABLE) {
    return EMOJI_TABLE[val];
  }
  return EMOJI_TABLE[3];
}

function rerender() {
  var body = document.getElementsByTagName("body")[0];
  var darkmode = localStorage.getItem("dark-mode") == "true";
  body.style.backgroundColor = (darkmode ? "black" : "");
  body.style.color = (darkmode ? "white" : "");
  document.getElementById("logo").src = (darkmode ? "logo-white.png" : "logo.png");
}

function updateDarkMode() {
  localStorage.setItem("dark-mode", document.getElementById("darkmode-checkbox").checked);
  rerender();
}

// constants
var MAX_NUM = 1000;
var NUM_PRIMES = 10;
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227];
const MY_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
// these are expensive to compute so store them
const BASE_PRICES = {2: 500, 3: 346, 5: 226, 7: 174, 11: 122, 13: 107, 17: 87, 19: 80, 23: 69, 29: 58}
const EMOJI_TABLE = {
  "-1": String.fromCodePoint(0x2611),
  "0": String.fromCodePoint(0x1F7E5),
  "1": String.fromCodePoint(0x1F7E7),
  "2": String.fromCodePoint(0x1F7E8),
  "3": String.fromCodePoint(0x1F7E9),
}

// always use pacific time
var d = new Date();
var pstDate = d.toLocaleString("en-us", {
  timeZone: "America/Los_Angeles"
});
var nd = new Date(pstDate);
var today = nd.getFullYear() + "" + (nd.getMonth() + 1) + "" + nd.getDate();

// taken from https://stackoverflow.com/a/52171480
const cyrb53 = function(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
  h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1>>>0);
};

var target = cyrb53(today) % (MAX_NUM + 1);
var numbers_left = Array.from(Array(MAX_NUM).keys())
// var todays_primes = []
var guesses = 0;
var won = false;
var spent = 0;
var share_emojis = [];
document.getElementById("share-button").style.display = "none";

MY_PRIMES.forEach(function (prime) {
  document.getElementById(prime+"-price").innerHTML = "¥" + BASE_PRICES[prime.toString()];
});

if (localStorage.getItem("dark-mode") === null) {
  localStorage.setItem("dark-mode", "false");
} else {
  document.getElementById("darkmode-checkbox").checked = (localStorage.getItem("dark-mode") == "true");
  rerender();
}

// check local storage for todays guesses
if (localStorage.getItem("date") != today) {
  localStorage.date = today;
  localStorage.todays_guesses = "[]";
} else {
  var arr = JSON.parse(localStorage.todays_guesses);
  for (var i = 0; i < arr.length; i++) {
    guess_helper(arr[i][0], arr[i][1]);
  }
}
// Shamelessly stolen from w3schools like a proper programmer.
document.getElementById("guess-input").addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("button").click();
  }
});
