/*  Melvor Combat Simulator v0.6.2: Adds a combat simulator to Melvor Idle

    Copyright (C) <2020>  <Coolrox95>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//Perform script injection
var injectableNames = ['main'];

for (let i=0;i<injectableNames.length;i++) {
    injectScript(injectableNames[i]);
}
/**
 * @description Injects a script onto the page of the 
 * @param {string} scriptName 
 */
function injectScript(scriptName) {
    var scriptID = `MCS ${scriptName}`;
    //Check if script already exists, if so delete it
    if (document.contains(document.getElementById(scriptID))) {
        document.getElementById(scriptID).remove();
    }
    //Inject script
    var scriptPath = chrome.runtime.getURL(`sources/injectable/${scriptName}.js`);
    var newScript = document.createElement('script');
    newScript.setAttribute('id',scriptID);
    newScript.src = scriptPath;
    document.body.appendChild(newScript);
}