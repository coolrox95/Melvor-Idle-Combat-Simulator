/*  Melvor Combat Simulator v0.8.2: Adds a combat simulator to Melvor Idle

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

// Perform script injection
const injectableNames = ['main'];

for (let i=0; i<injectableNames.length; i++) {
  injectScript(injectableNames[i]);
}
/**
 * @description Injects a script onto the page of the
 * @param {string} scriptName
 */
function injectScript(scriptName) {
  const scriptID = `MCS ${scriptName}`;
  // Check if script already exists, if so delete it
  if (document.contains(document.getElementById(scriptID))) {
    document.getElementById(scriptID).remove();
  }
  // Inject script
  const scriptPath = chrome.runtime.getURL(`sources/injectable/${scriptName}.js`);
  const newScript = document.createElement('script');
  newScript.setAttribute('id', scriptID);
  newScript.src = scriptPath;
  document.body.appendChild(newScript);
  // Inject Image resource
  const crossedOutURL = chrome.runtime.getURL('icons/crossedOut.svg');
  const crossedImage = document.createElement('img');
  crossedImage.id = 'mcsCrossedOut';
  crossedImage.src = crossedOutURL;
  crossedImage.style.display = 'none';
  document.body.appendChild(crossedImage);
}
