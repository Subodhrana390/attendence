let url = "https://attendence-nzxm.onrender.com";
const eventVenueCoords = { latitude: 30.8595727, longitude: 75.8638389 };
const maxDistance = 50;

function isNearEventVenue(userCoords) {
  const distance = calculateDistance(userCoords, eventVenueCoords);
  return distance <= maxDistance;
}

function calculateDistance(coord1, coord2) {
  const earthRadius = 6371e3; // Earth radius in meters
  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

document
  .getElementById("attendanceForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    navigator.geolocation.getCurrentPosition(function (position) {
      const userCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      if (isNearEventVenue(userCoords)) {
        const userData = {};
        formData.forEach((value, key) => {
          userData[key] = value;
        });
        console.log(userData);
        // Send the data using fetch API
        fetch(`${url}/record-attendance`, {
          method: "POST",
          body: JSON.stringify(userData),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            alert(data.message); // Show success message
            // You can perform additional actions here if needed
          })
          .catch((error) => {
            console.error("There was an error!", error);
            alert("Failed to record attendance. Please try again later.");
          });
      } else {
        alert("You are not near the event venue.");
      }
    }),
      function (error) {
        console.error("Error getting user location:", error);
        alert(
          "Error getting your location. Please make sure location services are enabled."
        );
      };
  });

let form = document.getElementById("attendanceForm");
let msg = document.getElementsByClassName("Message");

if (form.style.display == "block") {
} else {
  msg.innerText = "No Form Available";
}
function openFormForTwoHours() {
  var now = new Date();
  const scheduledTime = new Date("2024-04-01T13:30:00Z");
  form.style.display = "block";

  setTimeout(function () {
    form.style.display = "none";
  }, scheduledTime - now);
}

// Call the function to open the form when the page loads
window.onload = openFormForTwoHours;
