const tableBody = document.querySelector('#json-table tbody');
        const allGamestableBody = document.querySelector('#all-games-table tbody');
        const unplayedGamestableBody = document.querySelector('#unplayed-games-json-table tbody');

        fetch(nextGamesUrl, {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${getGame(item.upperteamname,item.opponent)}</td>
                        <td>${item.place.substring(3)}</td>
                        <td>${getDateString(new Date(item.dateCompare))}</td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

        //all games
        const now = new Date();
        fetch(allGamesUrl, {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                data.forEach(item => {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td>${getGame(item.upperteamname,item.opponent)}</td>
                        <td>${item.place.substring(3)}</td>
                        <td>${getDateString(new Date(item.dateCompare))}</td>
                        <td>${item.goals}:${item.opponentgoals}</td>
                    `;
                    allGamestableBody.appendChild(row);
                    const gameDate = new Date(item.dateCompare);
                    if (gameDate > now) {
                        const row2 = document.createElement('tr');
                        row2.innerHTML = `
                        <td>${getGame(item.upperteamname,item.opponent)}</td>
                        <td>${item.place.substring(3)}</td>
                        <td>${getDateString(new Date(item.dateCompare))}</td>
                    `;
                        unplayedGamestableBody.appendChild(row2);
                    }
                });
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

        function getGame(team, opponent){
            return `${team}<br>vs<br>${opponent}`
        }

        function getDateString(datetime) {
            const date = datetime.toLocaleString('de-DE', {
                timeZone: 'UTC',
                weekday: 'short',
                day: 'numeric',
                month: 'numeric',
            });
            const time = datetime.toLocaleString('de-DE', {
                timeZone: 'UTC',
                hour: 'numeric',
                minute: 'numeric'
            })
            return `${date}<br>${time} Uhr`;
        }

        function openTab(evt, tabName, displayName) {
            var i, tabcontent, tablinks;
            document.getElementById("header-text").innerHTML = displayName;
            tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(tabName).style.display = "block";
            evt.currentTarget.className += " active";
        }

        document.getElementById("default-open").click();