# Melvor-Idle-Combat-Simulator v0.6.2
A browser extension for the game [Melvor Idle](http://www.melvoridle.com/).  
This extension was built for version: Alpha v0.13 of Melvor Idle.

## How to Install
While this extension has been tested, it is still recommended to create a backup of your save file first.
After installing the extension, a refresh of the game may be required.

### Firefox:
Install from the [Firefox Addons Site](https://addons.mozilla.org/en-US/firefox/addon/melvor-idle-combat-simulator/).

### Chrome:
Currently not available on the chrome webstore, but you can download the sources here and add it as a [temporary addon](https://developer.chrome.com/extensions/getstarted).

## Instructions:
1. Toggle the display of the simulator using the option on the game's sidebar.
2. Select your gear using the drop down menus, or import it from the game. Select Prayers using the prayer menu. Select potions from the potions menu.
3. Select simulation options:
 - Max Hits: Controls the maximum number of attempts to hit an enemy before the simulation times out.
 - #Trials: Controls the number of times each enemy is simulated. Higher values lead to more accuracy at the expense of longer computation time.
 - Slayer Task? Toggles whether or not to calculate slayer XP as if you were completing a slayer task.
 - Sell Bones: Whether or not to sell bones. Used in GP calculations.
 - Sell Loot: Whether or not to sell all loot, a subset of loot or none of it.
   - When subset is selected you may edit which items to sell, by clicking Edit Subset.
   - Selecting Set Default will change the subset to keep combat unique items.
   - Selecting Set Discovered will change the subset to keep undiscovered items.
   - Hitting Cancel will prevent the subset from changing
   - Hitting Save will confirm the current settings.
4. Hit the Simulate button.
5. Select the Plot Type to visualize your simulation results.
 - XP per second: Experience points per second for selected combat style's skills.
 - HP XP per second: Experience points per second for the Hitpoints skill.
 - Prayer XP per second: Experience points per second for the Prayer skill.
 - Slayer XP per second: Experience points per second for the Slayer skill.
 - XP per Attack: Average amount of experience points per attack
 - HP loss per second: Average amount of HP lost per second while fighting an enemy/dungeon. Includes passive regen.
 - Prayer Points per second: Average amount of prayer points per second consumed.
 - Damage per second: Average damage per second.
 - Average Kill Time (s): The time it takes in seconds to kill a singly enemy for Combat Areas or the time to clear a Dungeon in seconds.
 - Damage per Attack: The average amount of damage done per attack.
 - GP per Kill: The average amount of GP earned when killing a monster/completing a dungeon.
 - GP per second: The average amount of GP earned per second.
 - Potential Herblore XP/s: The potential herblore xp earned using lucky herb potions. Assumes crafting the most xp efficient potions.
 - Signet Ring Chance (%): The probability to gain at least 1 Signet Ring Half B after fighting a monster for Signet Time (h) hours.
6. Click on a bar to view detailed information about that monster/dungeon.
## A Note On Simulation Accuracy
This simulator assumes that the game is running with absolutely no slowdowns, and each action is proccessed instantaneously. In reality this is not true, and measured rates will tend to be lower than simulation results.
## Screenshots
### Darkmode
![combatSim](https://imgur.com/DNrbI2Z.png)
### Lightmode
![combatSim](https://imgur.com/pCDLqQR.png)
## Suggestions and Feedback
Found a bug or want to request a feature?  
Feel free to message me on the [Melvor Idle Discord](https://discord.gg/TWDT7PM) or [submit a report](https://github.com/coolrox95/Melvor-Idle-Combat-Simulator/issues/new) to this repository.
