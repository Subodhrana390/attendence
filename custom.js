let url = "https://attendence-nzxm.onrender.com";
const eventVenueCoords = { latitude: 30.8595727, longitude: 75.8638389 };
const maxDistance = 250;

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

//Check Submission is allowed
function checkSubmission() {
  const lastSubmission = localStorage.getItem("lastSubmission");
  if (lastSubmission) {
    const lastSubmissionDate = new Date(lastSubmission);
    const currentDate = new Date();
    if ((currentDate - lastSubmissionDate) / (1000 * 60 * 60 * 24) >= 1) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
}

document
  .getElementById("attendanceForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    if (checkSubmission()) {
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
              return response.json();
            })
            .then((data) => {
              alert(data.message); // Show success message
              localStorage.setItem("lastSubmission", new Date());
            })
            .catch((error) => {
              alert("Failed to record attendance. Please try again later");
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
    } else {
      alert(
        "You have already submitted a form today. Please try again tomorrow."
      );
    }
  });

let form = document.getElementById("attendanceForm");

function openFormForTwoHours() {
  let now = new Date();
  const indiaTime = new Date(
    now.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    })
  );
  const scheduledDate = new Date("2024-04-07T17:59:30.000+05:30");
  const scheduledTime = new Date(
    scheduledDate.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    })
  );

  console.log(indiaTime, scheduledTime);
  form.style.display = "block";

  setTimeout(function () {
    form.style.display = "none";
    document.getElementById("message").innerHTML = "No Form Available";
  }, scheduledTime - indiaTime);
}

// Call the function to open the form when the page loads

window.onload = () => {
  document.getElementById("message").innerHTML = " ";
  setTimeout(() => {
    openFormForTwoHours();
  }, 1000);
};
