/*  Melvor Combat Simulator v0.1.1: Adds a combat simulator to Melvor Idle

    Copyright (C) <2019>  <Coolrox95>

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

class mcsApp {
        constructor() {
                //Parameters for dimensions
                this.contentHeight = 600;
                this.contentWidth = 1500;
                //Start by constructing the container
                this.container = document.createElement('div');
                this.container.className = 'mcsContainer';
                this.container.id = 'MCS Container';
                //Construct the content under the tab
                this.content = document.createElement('div')
                this.content.className = 'mcsTabContent'
                this.content.id = 'MCS Content';
                this.content.style.height = '600px';
                this.cardFiller = document.createElement('div');
                this.cardFiller.setAttribute('style', 'flex-grow: 1;order: 0;height: 0px')
                this.content.appendChild(this.cardFiller);
                //Generate gear subsets
                this.slotKeys = Object.keys(CONSTANTS.equipmentSlot);
                this.gearSubsets = [];
                this.gearSelected = [];
                for (let j = 0; j < this.slotKeys.length; j++) {
                        this.gearSubsets.push([{name: 'None',itemID: 0}]);
                        this.gearSelected.push(0);
                        for (let i = 0; i < items.length; i++) {
                                if (items[i].equipmentSlot == CONSTANTS.equipmentSlot[this.slotKeys[j]]) {
                                        this.gearSubsets[j].push(items[i]);
                                        this.gearSubsets[j][this.gearSubsets[j].length-1].itemID = i;
                                }
                                //Insert Sorting of subsets here
                        }
                }
                this.skillKeys = ['Attack','Strength','Defence','Ranged','Magic'];

                //Gear/Level/Style/Spell Selection Card:
                this.gearSelecter = new mcsCard(this.content, '345px', '100%', '120px', '220px');
                this.gearSelecter.addSectionTitle('Equipment');
                for (let i=0;i<this.gearSubsets.length;i++) {
                        let optionNames = [];
                        let optionValues = [];
                        this.gearSubsets[i].forEach(item => {optionNames.push(item.name);optionValues.push(item.itemID);});
                        this.gearSelecter.addDropdown(this.slotKeys[i],optionNames,optionValues,25,event=>this.gearDropdownOnChange(event,i));
                }
                this.gearSelecter.addSectionTitle('Player Levels');
                this.skillKeys.forEach(element => {
                        this.gearSelecter.addNumberInput(element,'1',25,1,99,event=>this.levelInputOnChange(event,element))
                });
                this.gearSelecter.addSectionTitle('Combat Style')
                //Style dropdown (Specially Coded)
                var combatStyleCCContainer = this.gearSelecter.createCCContainer(25);
                var combatStyleLabel = this.gearSelecter.createLabel('Style: ','');
                var meleeStyleDropdown = this.gearSelecter.createDropdown(['Stab', 'Slash', 'Block'],[0,1,2],'MCS Melee Style Dropdown',event=>this.styleDropdownOnChange(event,'Melee'));
                var rangedStyleDropdown = this.gearSelecter.createDropdown(['Accurate', 'Rapid', 'Longrange'],[0,1,2],'MCS Ranged Style Dropdown',event=>this.styleDropdownOnChange(event,'Ranged'));
                var magicStyleDropdown = this.gearSelecter.createDropdown(['Magic', 'Defensive'],[0,1],'MCS Magic Style Dropdown',event=>this.styleDropdownOnChange(event,'Magic'));
                rangedStyleDropdown.style.display = 'none';
                magicStyleDropdown.style.display = 'none';
                combatStyleCCContainer.appendChild(combatStyleLabel);
                combatStyleCCContainer.appendChild(meleeStyleDropdown);
                combatStyleCCContainer.appendChild(rangedStyleDropdown);
                combatStyleCCContainer.appendChild(magicStyleDropdown);
                this.gearSelecter.container.appendChild(combatStyleCCContainer);
                //Spell dropdown
                var spellOpts = [];
                var spellVals = [];
                for (let i=0;i<SPELLS.length;i++) {
                        spellOpts.push(SPELLS[i].name);
                        spellVals.push(i);
                }
                this.gearSelecter.addDropdown('Spell',spellOpts,spellVals,25,event=>this.spellDropdownOnChange(event));
                this.gearSelecter.addButton('Import from Game',event=>this.importButtonOnClick(event), 280, 25)


                //Gear Stats/Player Stats Display Card
                this.statDisplay = new mcsStatReadout(this);
                //Simulation/Plot Options Card
                this.simPlotOpts = new mcsSimPlotOptions(this);
                //Bar Chart Card
                this.plotter = new mcsPlotter(this, 670, this.contentHeight);
                //Simulation Object
                this.simulator = new mcsSimulator(this);

                //Construct the actual Tab
                this.tab = document.createElement('div')
                this.tab.id = 'MCS Tab';
                this.tab.className = 'mcsTab';
                this.tab.style.bottom = this.content.style.height;
                this.tab.onclick = this.tabOnClick;
                //Add Icon to tab
                this.logo = document.createElement('img');
                this.logo.setAttribute('style', `position: absolute;left: 3px;width: 44px;bottom: 3px`)
                this.logo.src = 'assets/media/skills/combat/combat.svg';
                this.tab.appendChild(this.logo);
                this.tabText = document.createElement('div');
                this.tabText.setAttribute('style', 'position: absolute;left: 50px;width: 150px;text-align: left;bottom: 13px;')
                this.tabText.textContent = 'Combat Simulator';
                this.tab.appendChild(this.tabText);

                this.container.appendChild(this.tab);
                this.container.appendChild(this.content);
                document.body.appendChild(this.container);
                //Push an update to the displays
                document.getElementById('MCS Spell Dropdown Container').style.display = 'none';
                this.simulator.computeGearStats();
                this.statDisplay.updateStatFields();
                this.simulator.computeCombatStats();
                this.statDisplay.updateCombatStats();
        }
        tabOnClick() {
                var x = document.getElementById('MCS Content');
                var y = document.getElementById('MCS Tab');
                if (x.style.display === 'none') {
                        x.style.display = 'flex';
                        y.style.bottom = x.style.height;
                } else {
                        x.style.display = 'none';
                        y.style.bottom = '0px';
                }
        }
        gearDropdownOnChange(event,gearID) {
                var itemID = parseInt(event.currentTarget.selectedOptions[0].value);
                this.gearSelected[gearID] = itemID;
                if (gearID == CONSTANTS.equipmentSlot.Weapon) {
                        if (items[itemID].isTwoHanded) {
                                this.gearSelecter.dropDowns[CONSTANTS.equipmentSlot.Shield].selectedIndex = 0;
                                this.gearSelected[CONSTANTS.equipmentSlot.Shield] = 0;
                                this.gearSelecter.dropDowns[CONSTANTS.equipmentSlot.Shield].disabled = true;
                        } else {
                                this.gearSelecter.dropDowns[CONSTANTS.equipmentSlot.Shield].disabled = false;
                        }
                        //Change to the correct combat style selector
                        if ((items[itemID].type === 'Ranged Weapon') || items[itemID].isRanged) {
                                this.disableStyleDropdown('Magic');
                                this.disableStyleDropdown('Melee');
                                this.enableStyleDropdown('Ranged');
                                //Magic
                        } else if (items[itemID].isMagic) {
                                this.disableStyleDropdown('Ranged');
                                this.disableStyleDropdown('Melee');
                                this.enableStyleDropdown('Magic');
                                //Melee
                        } else {
                                this.disableStyleDropdown('Magic');
                                this.disableStyleDropdown('Ranged');
                                this.enableStyleDropdown('Melee');
                        }
                }
                this.simulator.computeGearStats();
                this.statDisplay.updateStatFields();
                this.simulator.computeCombatStats();
                this.statDisplay.updateCombatStats();
        }
        levelInputOnChange(event,skillName) {
                var newLevel = parseInt(event.currentTarget.value);
                if (newLevel <= 99 && newLevel >= 1) {
                        this.simulator.playerLevels[skillName] = newLevel;
                        //This is the magic dropdown that has been changed, update spell list
                        if (skillName == 'Magic') {
                                this.updateSpellOptions(newLevel);
                        }
                }
                this.simulator.computeCombatStats();
                this.statDisplay.updateCombatStats();
        }
        styleDropdownOnChange(event,combatType) {
                var styleID = parseInt(event.currentTarget.selectedOptions[0].value);
                this.simulator.styles[combatType] = styleID;
                this.simulator.computeCombatStats();
                this.statDisplay.updateCombatStats();
        }
        spellDropdownOnChange(event) {
                var spellID = parseInt(event.currentTarget.selectedOptions[0].value);
                this.simulator.selectedSpell = spellID;
                this.simulator.computeCombatStats();
                this.statDisplay.updateCombatStats();
        }
        importButtonOnClick(event) {
                var gearID;
                for (let i = 0; i < this.slotKeys.length; i++) {
                        gearID = equippedItems[CONSTANTS.equipmentSlot[this.slotKeys[i]]];
                        this.gearSelected[i] = gearID;
                        if (gearID != 0) {
                                for (let j = 0; j < this.gearSubsets[i].length; j++) {
                                        if (this.gearSubsets[i][j].itemID == gearID) {
                                                this.gearSelecter.dropDowns[i].selectedIndex = j;
                                                break;
                                        }
                                }
                        } else {
                                this.gearSelecter.dropDowns[i].selectedIndex = 0;
                        }
                        //Do check for weapon type
                        if (i == CONSTANTS.equipmentSlot.Weapon) {
                                if (items[gearID].isTwoHanded) {
                                        this.gearSelecter.dropDowns[CONSTANTS.equipmentSlot.Shield].selectedIndex = 0;
                                        this.gearSelected[CONSTANTS.equipmentSlot.Shield] = 0;
                                        this.gearSelecter.dropDowns[CONSTANTS.equipmentSlot.Shield].disabled = true;
                                } else {
                                        this.gearSelecter.dropDowns[CONSTANTS.equipmentSlot.Shield].disabled = false;
                                }
                                //Change to the correct combat style selector
                                if ((items[gearID].type === 'Ranged Weapon') || items[gearID].isRanged) {
                                        this.disableStyleDropdown('Magic');
                                        this.disableStyleDropdown('Melee');
                                        this.enableStyleDropdown('Ranged');
                                        //Magic
                                } else if (items[gearID].isMagic) {
                                        this.disableStyleDropdown('Ranged');
                                        this.disableStyleDropdown('Melee');
                                        this.enableStyleDropdown('Magic');
                                        //Melee
                                } else {
                                        this.disableStyleDropdown('Magic');
                                        this.disableStyleDropdown('Ranged');
                                        this.enableStyleDropdown('Melee');
                                }
                        }
                }
                //Update levels from in game levels
                this.skillKeys.forEach(key => {
                        document.getElementById(`MCS ${key} Input`).value = skillLevel[CONSTANTS.skill[key]];
                        this.simulator.playerLevels[key] = skillLevel[CONSTANTS.skill[key]];
                })
                //Update attack style
                if (attackStyle <= 2) {
                        this.simulator.styles.Melee = attackStyle;
                        document.getElementById('MCS Melee Style Dropdown').selectedIndex = attackStyle;
                } else if (attackStyle <= 5) {
                        this.simulator.styles.Ranged = attackStyle - 3;
                        document.getElementById('MCS Ranged Style Dropdown').selectedIndex = attackStyle-3;
                } else {
                        this.simulator.styles.Magic = attackStyle - 6;
                        document.getElementById('MCS Magic Style Dropdown').selectedIndex = attackStyle-6;
                }
                //Update spells
                document.getElementById('MCS Spell Dropdown').selectedIndex = selectedSpell;
                this.simulator.selectedSpell = selectedSpell;
                this.updateSpellOptions(skillLevel[CONSTANTS.skill.Magic])
                this.simulator.computeGearStats();
                this.statDisplay.updateStatFields();
                this.simulator.computeCombatStats();
                this.statDisplay.updateCombatStats();
        }
        disableStyleDropdown(combatType) {
                document.getElementById(`MCS ${combatType} Style Dropdown`).style.display = 'none';
                if (combatType == 'Magic') {
                        document.getElementById('MCS Spell Dropdown Container').style.display = 'none';
                }
        }
        enableStyleDropdown(combatType) {
                document.getElementById(`MCS ${combatType} Style Dropdown`).style.display = 'inline';
                if (combatType == 'Magic') {
                        document.getElementById('MCS Spell Dropdown Container').style.display = 'block';
                }
        }
        updateSpellOptions(magicLevel) {
                var spellDropdown = document.getElementById('MCS Spell Dropdown');
                spellDropdown.children.forEach(child => {
                        if (SPELLS[parseInt(child.value)].magicLevelRequired <= magicLevel) {
                                child.style.display = 'block';
                        } else {
                                child.style.display = 'none';
                        }
                })
        }

}
class mcsPlotter {
        constructor(parent, width, height) {
                this.parent = parent;
                this.barWidth = 20;
                this.barGap = 1;
                this.plotBoxHeight = 500;
                this.yAxisWidth = 80;
                this.xAxisHeight = 80;
                this.titleHeight = height - this.plotBoxHeight - this.xAxisHeight;
                this.barNames = [];
                this.barImageSrc = [];
                this.barBottomNames = [];
                this.barBottomLength = [];
                var totBars = 0;

                for (let i = 0; i < combatAreas.length; i++) {
                        totBars += combatAreas[i].monsters.length;
                        this.barBottomNames.push(combatAreas[i].areaName);
                        this.barBottomLength.push(combatAreas[i].monsters.length);
                        for (let j = 0; j < combatAreas[i].monsters.length; j++) {
                                this.barNames.push(MONSTERS[combatAreas[i].monsters[j]].name);
                                this.barImageSrc.push(MONSTERS[combatAreas[i].monsters[j]].media);
                        }
                }
                this.barBottomNames.push('Dungeons');
                this.barBottomLength.push(DUNGEONS.length);
                totBars += DUNGEONS.length;
                for (let i = 0; i < DUNGEONS.length; i++) {
                        this.barNames.push(DUNGEONS[i].name);
                        this.barImageSrc.push(DUNGEONS[i].media);
                }

                this.width = this.barWidth*totBars+this.barGap*2+this.yAxisWidth;

                this.plotContainer = document.createElement('div');
                this.plotContainer.className = 'mcsPlotContainer';
                this.plotContainer.setAttribute('style', `width: ${this.width}px;min-width: ${this.width}px;`);
                this.plotContainer.id = 'MCS Plotter';

                this.plotTopContainer = document.createElement('div');
                this.plotTopContainer.className = 'mcsPlotTopContainer';
                this.plotTopContainer.id = 'MCS Plotter Top Container';
                this.plotContainer.appendChild(this.plotTopContainer);
                
                this.plotBox = document.createElement('div');
                this.plotBox.className = 'mcsPlotBox';
                this.plotBox.setAttribute('style', `width: ${this.barGap * 2 + this.barWidth * totBars}px;`);
                this.plotTopContainer.appendChild(this.plotBox);
                this.yAxis = document.createElement('div');
                this.yAxis.id = 'MCS Plotter Y-Axis';
                this.yAxis.className = 'mcsYAxis';
                this.yAxis.setAttribute('style', `width: ${this.yAxisWidth}px;`)
                this.plotTopContainer.appendChild(this.yAxis);

                this.xAxis = document.createElement('div');
                this.xAxis.className = 'mcsXAxis'
                this.xAxis.id = 'MCS Plotter X-Axis';
                this.xAxis.setAttribute('style', `width: ${this.barWidth * totBars}px;margin-right: ${this.barGap}px;`)
                this.plotContainer.appendChild(this.xAxis);



                //Do Gridlines
                this.gridLine = [];
                this.gridLineStyle = `position: absolute;width: 100%;height: 5%;left: 0px;border-bottom: thin solid #E4E4E4;`
                for (let i = 0; i < 20; i++) {
                        this.gridLine.push(document.createElement('div'));
                        this.gridLine[i].setAttribute('style', this.gridLineStyle);
                        this.gridLine[i].style.bottom = `${(i + 1) * 5}%`;
                        this.plotBox.appendChild(this.gridLine[i]);
                }

                //Do Bars and images
                var barColor = '#0072BD'
                this.barStyle = `position: absolute;width: ${this.barWidth - this.barGap * 2}px;height: 100%;bottom: 0px;background: ${barColor};`;
                this.xAxisImages = [];
                this.xAxisImageStyle = `position: absolute;width: ${this.barWidth}px;height ${this.barWidth}px;top: 0px;`;
                this.bars = [];
                for (let i = 0; i < totBars; i++) {
                        this.bars.push(document.createElement('div'));
                        this.bars[i].setAttribute('style', this.barStyle);
                        this.bars[i].style.left = `${this.barGap + i * this.barWidth}px`;
                        this.plotBox.appendChild(this.bars[i]);

                        this.xAxisImages.push(document.createElement('img'));
                        this.xAxisImages[i].setAttribute('src', this.barImageSrc[i]);
                        this.xAxisImages[i].setAttribute('style', this.xAxisImageStyle);
                        this.xAxisImages[i].style.left = `${i * this.barWidth}px`;
                        this.xAxis.appendChild(this.xAxisImages[i]);
                }
                //Do Second descriptions
                var botLength = 0;
                this.barBottomDivs = [];
                this.barBottomStyle = `position: absolute;height: ${this.xAxisHeight - 20}px;top: 20px;text-align: center`;
                for (let i = 0; i < this.barBottomNames.length; i++) {
                        this.barBottomDivs.push(document.createElement('div'));
                        this.barBottomDivs[i].appendChild(document.createTextNode(this.barBottomNames[i]));
                        this.barBottomDivs[i].setAttribute('style', this.barBottomStyle);
                        this.barBottomDivs[i].style.left = `${100 * botLength / totBars}%`;
                        this.barBottomDivs[i].style.width = `${100 * this.barBottomLength[i] / totBars}%`;
                        this.xAxis.appendChild(this.barBottomDivs[i]);
                        botLength += this.barBottomLength[i];
                }
                //Do tickmarks
                this.tickMarks = [];
                this.tickStyle = `position: absolute;width: 2.5%;height: 5%;left: 0px;border-bottom: thin solid black;`
                for (let i = 0; i < 20; i++) {
                        this.tickMarks.push(document.createElement('div'));
                        this.tickMarks[i].setAttribute('style', this.tickStyle);
                        this.tickMarks[i].style.bottom = `${(i + 1) * 5}%`;
                        this.plotBox.appendChild(this.tickMarks[i]);

                }
                //Do ticktext
                this.tickText = [];
                this.tickTextStyle = `position: absolute;width: 100%;height: 5%;right: 0px;text-align: right;`;
                for (let i = 0; i < 21; i++) {
                        this.tickText.push(document.createElement('div'));
                        this.tickText[i].setAttribute('style', this.tickTextStyle);
                        this.tickText[i].style.bottom = `${i * 5 - 2.5}%`;
                        this.tickText[i].appendChild(document.createTextNode(mcsFormatNum(i * 0.05, 2)));
                        this.yAxis.appendChild(this.tickText[i]);
                }
                //Do Tooltips
                this.barTooltips = [];
                this.toolTipStyle = `position: absolute;width: 60px;height: 25px;border: thin solid black;background: #FFFFFF;display: none;text-align: center`;
                for (let i = 0; i < this.bars.length; i++) {
                        this.barTooltips.push(document.createElement('div'));
                        this.barTooltips[i].setAttribute('style', this.toolTipStyle)
                        this.barTooltips[i].style.top = '0%';
                        if (i < (this.bars.length - 3)) {
                                this.barTooltips[i].style.left = `${i * this.barWidth + 11}px`;
                        } else {
                                this.barTooltips[i].style.right = `${(this.bars.length - i) * this.barWidth - 11}px`;
                        }
                        this.plotBox.appendChild(this.barTooltips[i]);
                        this.bars[i].onmouseover = event => this.callBackBarMouseOver(event, i);
                        this.bars[i].onmouseout = event => this.callBackBarMouseOut(event, i);
                }

                this.parent.content.appendChild(this.plotContainer);
                /*
                var testData = [];
                for (let i = 0; i < this.bars.length; i++) {
                        testData.push(Math.random());
                }
                this.updateBars(testData);
                */
        }

        callBackBarMouseOver(event, id) {
                this.barTooltips[id].style.display = 'block';
        }

        callBackBarMouseOut(event, id) {
                this.barTooltips[id].style.display = 'none';
        }

        updateBars(barData) {
                var barMax = barData[0];
                for (let i = 1; i < barData.length; i++) {
                        if (barData[i] > barMax) {
                                barMax = barData[i];
                        }
                }
                var divRatio = barMax / Math.pow(10, Math.floor(Math.log10(barMax)) + 1);
                var closestRatio;
                if (divRatio >= 0.5) {
                        closestRatio = 0.5;
                } else if (divRatio >= 0.25) {
                        closestRatio = 0.25;
                } else if (divRatio >= 0.2) {
                        closestRatio = 0.2;
                } else if (divRatio >= 0.1) {
                        closestRatio = 0.1;
                }
                var division = closestRatio * Math.pow(10, Math.floor(Math.log10(barMax)));
                var Ndivs = Math.ceil(barMax / division);
                var divMax = Ndivs * division;

                for (let i = 0; i < this.bars.length; i++) {
                        this.bars[i].style.height = `${barData[i] / divMax * 100}%`;
                        this.barTooltips[i].style.top = `${(1 - barData[i] / divMax) * 100}%`;
                        this.barTooltips[i].textContent = mcsFormatNum(barData[i], 2);
                        if ((1 - barData[i] / divMax) * 100 > 92) {
                                this.barTooltips[i].style.top = '92%';
                        }
                }

                for (let i = 0; i < 20; i++) {
                        if (i < (Ndivs - 1)) {
                                this.tickMarks[i].style.display = 'block';
                                this.tickMarks[i].style.bottom = `${(i + 1) * 100 / Ndivs}%`;
                                this.gridLine[i].style.display = 'block';
                                this.gridLine[i].style.bottom = `${(i + 1) * 100 / Ndivs}%`;
                        } else {
                                this.tickMarks[i].style.display = 'none';
                                this.gridLine[i].style.display = 'none';
                        }
                }
                for (let i = 0; i < 21; i++) {
                        if (i < (Ndivs + 1)) {
                                this.tickText[i].style.display = 'block';
                                this.tickText[i].style.bottom = `${i * 100 / Ndivs - 2.5}%`;
                                this.tickText[i].textContent = mcsFormatNum(i * division, 2);
                        } else {
                                this.tickText[i].style.display = 'none';
                        }
                }
        }
}

class mcsStatReadout {
        /**
         * 
         * @param {mcsApp} parent 
         */
        constructor(parent) {

                this.statNames = ['Attack Speed', 'Strength Bonus', 'Stab Bonus', 'Slash Bonus', 'Block Bonus', 'Attack Bonus', 'Strength Bonus', 'Attack Bonus', '% Damage Bonus', 'Defence Bonus', 'Damage Reduction', 'Defence Bonus', 'Defence Bonus', 'Level Required', 'Level Required', 'Level Required', 'Level Required'];
                this.statIcons = ['combat', 'strength', 'attack', 'strength', 'defence', 'ranged', 'ranged', 'magic', 'magic', 'defence', 'defence', 'ranged', 'magic', 'attack', 'defence', 'ranged', 'magic']
                this.iconSources = {
                        combat: 'assets/media/skills/combat/combat.svg',
                        attack: 'assets/media/skills/combat/attack.svg',
                        strength: 'assets/media/skills/combat/strength.svg',
                        ranged: 'assets/media/skills/ranged/ranged.svg',
                        magic: 'assets/media/skills/magic/magic.svg',
                        defence: 'assets/media/skills/defence/defence.svg'
                };
                this.statKeys = ['eqpAttSpd', 'strBon', 'attBon0', 'attBon1', 'attBon2', 'rngAttBon', 'rngStrBon', 'magAttBon', 'magDmgBon', 'defBon', 'dmgRed', 'rngDefBon', 'magDefBon', 'attReq', 'defReq', 'rngReq', 'magReq'];
                this.statHeight = 20;
                this.labelWidth = 150;
                this.fieldWidth = 50;
                this.statWidth = this.statHeight + this.labelWidth + this.fieldWidth + 4;
                this.sectionStyle = `height: ${20}px;font-size: 18px;margin-top: 2px;margin-bottom: 2px;width: ${this.statWidth}px;text-align: center;`;
                this.parent = parent;
                this.container = document.createElement('div');
                this.container.setAttribute('style', `height: 100%;font-size: 16px;line-height: ${this.statHeight}px;min-width: ${this.statWidth}px;margin-right: 5px;
                display: flex;flex-direction: column;flex-wrap: nowrap;justify-content: flex-start;background: white;`);
                this.container.id = 'MCS Stat Readout';
                this.createSection('Gear Stats')
                this.statContainers = [];
                this.statImages = [];
                this.statLabels = [];
                this.statFields = [];
                for (let i = 0; i < this.statNames.length; i++) {
                        this.statContainers.push(document.createElement('div'));
                        this.statContainers[i].style.width = `${this.statWidth}px`;
                        this.statContainers[i].style.height = `${this.statHeight}px`;
                        this.statContainers[i].style.position = 'relative';
                        this.container.appendChild(this.statContainers[i]);
                        //Images before labels
                        this.statImages.push(document.createElement('img'));
                        this.statImages[i].src = this.iconSources[this.statIcons[i]];
                        this.statImages[i].style.width = `${this.statHeight}px`;
                        this.statImages[i].style.height = `${this.statHeight}px`;
                        this.statImages[i].style.position = 'absolute';
                        this.statImages[i].style.left = 0;
                        this.statContainers[i].appendChild(this.statImages[i]);
                        //Label Text
                        this.statLabels.push(document.createElement('label'));
                        this.statLabels[i].textContent = this.statNames[i];
                        this.statLabels[i].style.width = `${this.labelWidth}px`;
                        this.statLabels[i].style.height = '100%';
                        this.statLabels[i].style.left = `${this.statHeight + 2}px`;
                        this.statLabels[i].style.position = 'absolute';
                        this.statLabels[i].style.textAlign = 'left';
                        this.statContainers[i].appendChild(this.statLabels[i]);
                        //Actual Data
                        this.statFields.push(document.createElement('div'));
                        this.statFields[i].style.right = 0;
                        this.statFields[i].style.width = `${this.fieldWidth}px`;
                        this.statFields[i].style.height = '100%';
                        this.statFields[i].style.position = 'absolute';
                        this.statFields[i].appendChild(document.createTextNode('0'));
                        this.statFields[i].style.textAlign = 'right';
                        this.statFields[i].style.border = 'thin solid black';
                        this.statContainers[i].appendChild(this.statFields[i]);
                }
                this.createSection('Combat Stats')
                //Create elements for combatstats
                this.combatStatKeys = ['attackSpeed', 'maxHit', 'maxAttackRoll', 'maxDefRoll', 'maxRngDefRoll', 'maxMagDefRoll', 'dmgRed'];
                this.combatStatNames = ['Attack Speed', 'Max Hit', 'Accuracy Rating', 'Evasion Rating', 'Evasion Rating', 'Evasion Rating', 'Damage Reduction'];
                this.combatStatIcons = ['', '', '', 'combat', 'ranged', 'magic', ''];
                this.combatStatContainers = [];
                this.combatStatImages = [];
                this.combatStatLabels = [];
                this.combatStatFields = [];
                for (let i = 0; i < this.combatStatKeys.length; i++) {
                        this.combatStatContainers.push(document.createElement('div'));
                        this.combatStatContainers[i].setAttribute('style', `position: relative;width: ${this.statWidth}px;height: ${this.statHeight}px;`)
                        this.container.appendChild(this.combatStatContainers[i]);

                        if (this.combatStatIcons[i] != '') {
                                this.combatStatImages.push(document.createElement('img'));
                                this.combatStatImages[i].src = this.iconSources[this.combatStatIcons[i]];
                                this.combatStatImages[i].setAttribute('style', `width: ${this.statHeight}px;height: ${this.statHeight}px;position: absolute;left: 0px;`)
                                this.combatStatContainers[i].appendChild(this.combatStatImages[i]);
                        } else {
                                this.combatStatImages.push(0)
                        }
                        this.combatStatLabels.push(document.createElement('label'));
                        this.combatStatLabels[i].setAttribute('style', `width: ${this.labelWidth}px;height: 100%;left: ${this.statHeight + 2}px;position: absolute;text-align: left;`);
                        this.combatStatLabels[i].textContent = this.combatStatNames[i];
                        this.combatStatContainers[i].appendChild(this.combatStatLabels[i]);

                        this.combatStatFields.push(document.createElement('div'));
                        this.combatStatFields[i].setAttribute('style', `position: absolute;height: 100%;right: 0px;width: ${this.fieldWidth}px;text-align: right;border: thin solid black;`)
                        this.combatStatFields[i].appendChild(document.createTextNode('0'));
                        this.combatStatContainers[i].appendChild(this.combatStatFields[i]);
                }


                this.parent.content.appendChild(this.container);
        }
        updateStatFields() {
                for (let i = 0; i < this.statFields.length; i++) {
                        if (this.statKeys[i] == 'attBon0') {
                                this.statFields[i].textContent = this.parent.simulator.attBon[0];
                        } else if (this.statKeys[i] == 'attBon1') {
                                this.statFields[i].textContent = this.parent.simulator.attBon[1];
                        } else if (this.statKeys[i] == 'attBon2') {
                                this.statFields[i].textContent = this.parent.simulator.attBon[2];
                        } else {
                                this.statFields[i].textContent = this.parent.simulator[this.statKeys[i]];
                        }
                }
        }

        updateCombatStats() {
                for (let i = 0; i < this.combatStatFields.length; i++) {
                        this.combatStatFields[i].textContent = this.parent.simulator[this.combatStatKeys[i]];
                }
        }

        createSection(sectionTitle) {
                var newSection = document.createElement('div');
                newSection.setAttribute('style', this.sectionStyle)
                newSection.textContent = sectionTitle;
                this.container.appendChild(newSection);
        }
}

class mcsSimulator {
        /**
         * 
         * @param {mcsApp} parent 
         */
        constructor(parent) {
                this.parent = parent;
                //Player combat stats
                this.playerLevels = {
                        Attack: 0,
                        Strength: 0,
                        Defence: 0,
                        Ranged: 0,
                        Magic: 0
                };
                //Equipment Stats
                this.eqpAttSpd = 4000;
                this.strBon = 0;
                this.attBon = [0, 0, 0];
                this.rngAttBon = 0;
                this.rngStrBon = 0;
                this.magAttBon = 0;
                this.magDmgBon = 0;
                this.defBon = 0;
                this.dmgRed = 0;
                this.rngDefBon = 0;
                this.magDefBon = 0;
                this.attReq = 1;
                this.rngReq = 1;
                this.magReq = 1;
                this.defReq = 1;
                //Combat Stats
                this.selectedSpell = 0;
                this.styles = {
                        Melee: 0,
                        Ranged: 0,
                        Magic: 0
                };
                this.attackSpeed = 4000;
                this.attackType = 0;
                this.maxAttackRoll = 0;
                this.maxHit = 0;
                this.maxMagDefRoll = 0;
                this.maxDefRoll = 0;
                this.maxRngDefRoll = 0;
                //Simulation settings
                this.Nhitmax = 1000; //Max number of player hits to attempt before timeout
                this.Ntrials = 1000; //Number of enemy kills to simulate
                //Simulation data;
                this.monsterSimData = [];
                for (let i = 0; i < MONSTERS.length; i++) {
                        this.monsterSimData.push({
                                simDone: false,
                                simSuccess: false,
                                xpPerEnemy: 0,
                                xpPerSecond: 0,
                                hpxpPerEnemy: 0,
                                hpxpPerSecond: 0,
                                hpPerEnemy: 0,
                                hpPerSecond: 0,
                                dmgPerSecond: 0,
                                avgKillTime: 0,
                                avgNumHits: 0,
                                avgHitDmg: 0,
                                killTimeS: 0
                        })
                }
                this.dungeonSimData = [];
                for (let i = 0; i < DUNGEONS.length; i++) {
                        this.dungeonSimData.push({
                                simSuccess: false,
                                xpPerSecond: 0,
                                hpxpPerSecond: 0,
                                hpPerEnemy: 0,
                                hpPerSecond: 0,
                                dmgPerSecond: 0,
                                avgKillTime: 0,
                                avgNumHits: 0,
                                avgHitDmg: 0,
                                killTimeS: 0
                        })
                }
        }
        computeGearStats() {
                this.resetGearStats();
                for (let i = 0; i < this.parent.slotKeys.length; i++) {
                        var itemID = this.parent.gearSelected[i];
                        if (itemID == 0) {
                                continue
                        } else {
                                var curItem = items[itemID];
                        }
                        this.strBon += (curItem.strengthBonus) ? curItem.strengthBonus : 0;
                        if (curItem.attackBonus != undefined) {
                                for (let j = 0; j < 3; j++) {
                                        this.attBon[j] += curItem.attackBonus[j];
                                }
                        }
                        this.rngAttBon += (curItem.rangedAttackBonus) ? curItem.rangedAttackBonus : 0;
                        this.rngStrBon += (curItem.rangedStrengthBonus) ? curItem.rangedStrengthBonus : 0;
                        this.magAttBon += (curItem.magicAttackBonus) ? curItem.magicAttackBonus : 0;
                        this.magDmgBon += (curItem.magicDamageBonus) ? curItem.magicDamageBonus : 0;
                        this.defBon += (curItem.defenceBonus) ? curItem.defenceBonus : 0;
                        this.dmgRed += (curItem.damageReduction) ? curItem.damageReduction : 0;
                        this.rngDefBon += (curItem.rangedDefenceBonus) ? curItem.rangedDefenceBonus : 0;
                        this.magDefBon += (curItem.magicDefenceBonus) ? curItem.magicDefenceBonus : 0;

                        if (((curItem.attackLevelRequired) ? curItem.attackLevelRequired : 1) > this.attReq) {
                                this.attReq = curItem.attackLevelRequired;
                        }
                        if (((curItem.rangedLevelRequired) ? curItem.rangedLevelRequired : 1) > this.rngReq) {
                                this.rngReq = curItem.rangedLevelRequired;
                        }
                        if (((curItem.magicLevelRequired) ? curItem.magicLevelRequired : 1) > this.magReq) {
                                this.magReq = curItem.magicLevelRequired;
                        }
                        if (((curItem.defenceLevelRequired) ? curItem.defenceLevelRequired : 1) > this.defReq) {
                                this.defReq = curItem.defenceLevelRequired;
                        }
                        if (i == CONSTANTS.equipmentSlot.Weapon) {
                                this.eqpAttSpd = (curItem.attackSpeed) ? curItem.attackSpeed : 4000;
                        }
                }
        }
        computeCombatStats() {
                // ['Attack','Strength','Defence','Ranged','Magic']
                this.attackSpeed = 4000;
                var attackStyleBonus = 1;
                var meleeDefenceBonus = 1;
                var weaponID = this.parent.gearSelected[CONSTANTS.equipmentSlot.Weapon];
                //Ranged
                if ((items[weaponID].type === 'Ranged Weapon') || items[weaponID].isRanged) {
                        this.attackType = 1;
                        if (this.styles.Ranged == 0) {
                                attackStyleBonus += 3;
                                this.attackSpeed = this.eqpAttSpd;
                        } else if (this.styles.Ranged == 1) {
                                this.attackSpeed = this.eqpAttSpd - 400;
                        } else {
                                meleeDefenceBonus += 3;
                                this.attackSpeed = this.eqpAttSpd;
                        }
                        var effectiveAttackLevel = Math.floor(this.playerLevels.Ranged + 8 + attackStyleBonus);
                        this.maxAttackRoll = effectiveAttackLevel * (this.rngAttBon + 64);

                        var effectiveStrengthLevel = Math.floor(this.playerLevels.Ranged + attackStyleBonus);
                        this.maxHit = Math.floor(1.3 + effectiveStrengthLevel / 10 + this.rngStrBon / 80 + effectiveStrengthLevel * this.rngStrBon / 640);
                        //Magic
                } else if (items[weaponID].isMagic) {
                        this.attackType = 2;
                        effectiveAttackLevel = Math.floor(this.playerLevels.Magic + 8 + attackStyleBonus);
                        this.maxAttackRoll = effectiveAttackLevel * (this.magAttBon + 64);
                        this.maxHit = Math.floor(SPELLS[this.selectedSpell].maxHit + (SPELLS[this.selectedSpell].maxHit * (this.magDmgBon / 100)));
                        this.attackSpeed = this.eqpAttSpd;
                        //Melee
                } else {
                        this.attackType = 0;
                        effectiveAttackLevel = Math.floor(this.playerLevels.Attack + 8 + attackStyleBonus);
                        this.maxAttackRoll = effectiveAttackLevel * (this.attBon[this.styles.Melee] + 64);

                        effectiveStrengthLevel = Math.floor(this.playerLevels.Strength + 8 + 1);
                        this.maxHit = Math.floor(1.3 + effectiveStrengthLevel / 10 + this.strBon / 80 + effectiveStrengthLevel * this.strBon / 640);
                        this.attackSpeed = this.eqpAttSpd;
                }
                var effectiveDefenceLevel = Math.floor(this.playerLevels.Defence + 8 + meleeDefenceBonus);
                this.maxDefRoll = effectiveDefenceLevel * (this.defBon + 64);
                var effectiveRngDefenceLevel = Math.floor(this.playerLevels.Defence + 8 + 1);
                this.maxRngDefRoll = effectiveRngDefenceLevel * (this.rngDefBon + 64);
                var effectiveMagicDefenceLevel = Math.floor(Math.floor(this.playerLevels.Magic * 0.7) + Math.floor(this.playerLevels.Defence * 0.3) + 8 + 1);
                this.maxMagDefRoll = effectiveMagicDefenceLevel * (this.magDefBon + 64);
        }
        resetGearStats() {
                this.eqpAttSpd = 4000;
                this.strBon = 0;
                this.attBon = [0, 0, 0];
                this.rngAttBon = 0;
                this.rngStrBon = 0;
                this.magAttBon = 0;
                this.magDmgBon = 0;
                this.defBon = 0;
                this.dmgRed = 0;
                this.rngDefBon = 0;
                this.magDefBon = 0;
                this.attReq = 1;
                this.rngReq = 1;
                this.magReq = 1;
                this.defReq = 1;
        }
        simulateCombat() {
                //Start by grabbing the player stats
                var playerStats = {
                        attackSpeed: this.attackSpeed,
                        attackType: this.attackType,
                        maxAttackRoll: this.maxAttackRoll,
                        maxHit: this.maxHit,
                        maxDefRoll: this.maxDefRoll,
                        maxMagDefRoll: this.maxMagDefRoll,
                        maxRngDefRoll: this.maxRngDefRoll,
                        xpBonus: 0
                }
                if (this.parent.gearSelected[CONSTANTS.equipmentSlot.Ring] == CONSTANTS.item.Gold_Emerald_Ring) {
                        playerStats.xpBonus = 0.1;
                }
                var Ntrials = this.Ntrials;
                var Nhitmax = this.Nhitmax;
                //Reset the simulation status of all enemies
                this.resetSimDone();
                //Perform simulation of monsters in combat areas
                for (let i = 0; i < combatAreas.length; i++) {
                        for (let j = 0; j < combatAreas[i].monsters.length; j++) {
                                this.simulateMonster(combatAreas[i].monsters[j], playerStats, Ntrials, Nhitmax);
                        }
                }
                //Perform simulation of monsters in dungeons
                for (let i = 0; i < DUNGEONS.length; i++) {
                        for (let j = 0; j < DUNGEONS[i].monsters.length; j++) {
                                this.simulateMonster(DUNGEONS[i].monsters[j], playerStats, Ntrials, Nhitmax);
                        }
                }
                //Perform calculation of dungeon stats
                var totXp = 0;
                var totHpXp = 0;
                var totHits = 0;
                var totHP = 0;
                var totEnemyHP = 0;
                var totTime = 0;

                for (let i = 0; i < DUNGEONS.length; i++) {
                        this.dungeonSimData[i].simSuccess = true;
                        totXp = 0;
                        totHpXp = 0;
                        totHits = 0;
                        totHP = 0;
                        totEnemyHP = 0;
                        totTime = 0;
                        for (let j = 0; j < DUNGEONS[i].monsters.length; j++) {
                                let mInd = DUNGEONS[i].monsters[j];
                                totXp += this.monsterSimData[mInd].xpPerEnemy;
                                totHpXp += this.monsterSimData[mInd].hpxpPerEnemy;
                                totHits += this.monsterSimData[mInd].avgNumHits;
                                totHP += this.monsterSimData[mInd].hpPerEnemy;
                                totEnemyHP += MONSTERS[mInd].hitpoints;
                                totTime += this.monsterSimData[mInd].avgKillTime;
                                if (!this.monsterSimData[mInd].simSuccess) {
                                        this.dungeonSimData[i].simSuccess = false;
                                        break;
                                }
                        }
                        if (this.dungeonSimData[i].simSuccess) {
                                this.dungeonSimData[i].xpPerSecond = totXp / totTime * 1000;
                                this.dungeonSimData[i].hpxpPerSecond = totHpXp / totTime * 1000;
                                this.dungeonSimData[i].hpPerSecond = totHP / totTime * 1000;
                                this.dungeonSimData[i].dmgPerSecond = totEnemyHP / totTime * 1000;
                                this.dungeonSimData[i].avgKillTime = totTime;
                                this.dungeonSimData[i].avgNumHits = totHits;
                                this.dungeonSimData[i].avgHitDmg = totEnemyHP / totHits;
                                this.dungeonSimData[i].killTimeS = totTime / 1000;
                        }
                }
        }

        simulateMonster(monsterID, playerStats, Ntrials, Nhitmax) {
                //Check if already simulated
                if (this.monsterSimData[monsterID].simDone) {
                        return
                }
                var enemyStats = {
                        hitpoints: 0,
                        attackSpeed: 0,
                        attackType: 0,
                        maxAttackRoll: 0,
                        maxHit: 0,
                        maxDefRoll: 0,
                        maxMagDefRoll: 0,
                        maxRngDefRoll: 0,
                }
                //Calculate Enemy Stats
                enemyStats.hitpoints = MONSTERS[monsterID].hitpoints;
                enemyStats.attackSpeed = MONSTERS[monsterID].attackSpeed
                var effectiveDefenceLevel = Math.floor(MONSTERS[monsterID].defenceLevel + 8 + 1);
                enemyStats.maxDefRoll = effectiveDefenceLevel * (MONSTERS[monsterID].defenceBonus + 64);

                var effectiveRangedDefenceLevel = Math.floor(MONSTERS[monsterID].defenceLevel + 8 + 1);
                enemyStats.maxRngDefRoll = effectiveRangedDefenceLevel * (MONSTERS[monsterID].defenceBonusRanged + 64);
                var effectiveMagicDefenceLevel = Math.floor((Math.floor(MONSTERS[monsterID].magicLevel * 0.7) + Math.floor(MONSTERS[monsterID].defenceLevel * 0.3)) + 8 + 1);
                enemyStats.maxMagDefRoll = effectiveMagicDefenceLevel * (MONSTERS[monsterID].defenceBonusMagic + 64);
                enemyStats.attackType = MONSTERS[monsterID].attackType;

                if (MONSTERS[monsterID].attackType === CONSTANTS.attackType.Melee) {
                        var effectiveAttackLevel = Math.floor(MONSTERS[monsterID].attackLevel + 8 + 1);
                        enemyStats.maxAttackRoll = effectiveAttackLevel * (MONSTERS[monsterID].attackBonus + 64);
                        var effectiveStrengthLevel = Math.floor(MONSTERS[monsterID].strengthLevel + 8 + 1);
                        enemyStats.maxHit = Math.floor(1.3 + (effectiveStrengthLevel / 10) + (MONSTERS[monsterID].strengthBonus / 80) + (effectiveStrengthLevel * MONSTERS[monsterID].strengthBonus / 640));
                }
                else if (MONSTERS[monsterID].attackType === CONSTANTS.attackType.Ranged) {
                        var effectiveAttackLevel = Math.floor(MONSTERS[monsterID].rangedLevel + 8 + 1);
                        enemyStats.maxAttackRoll = effectiveAttackLevel * (MONSTERS[monsterID].attackBonusRanged + 64);
                        var effectiveStrengthLevel = Math.floor(MONSTERS[monsterID].rangedLevel + 8 + 1);
                        enemyStats.maxHit = Math.floor(1.3 + (effectiveStrengthLevel / 10) + (MONSTERS[monsterID].strengthBonusRanged / 80) + (effectiveStrengthLevel * MONSTERS[monsterID].strengthBonusRanged / 640));
                }
                else if (MONSTERS[monsterID].attackType === CONSTANTS.attackType.Magic) {
                        var effectiveAttackLevel = Math.floor(MONSTERS[monsterID].magicLevel + 8 + 1);
                        enemyStats.maxAttackRoll = effectiveAttackLevel * (MONSTERS[monsterID].attackBonusMagic + 64);
                        enemyStats.maxHit = Math.floor(SPELLS[MONSTERS[monsterID].selectedSpell].maxHit + (SPELLS[MONSTERS[monsterID].selectedSpell].maxHit * (MONSTERS[monsterID].damageBonusMagic / 100)));
                }
                //Calculate Accuracy
                var playerAccuracy = this.calculateAccuracy(playerStats, enemyStats);
                var enemyAccuracy = this.calculateAccuracy(enemyStats, playerStats)

                //Start Monte Carlo simulation
                var enemyKills = 0;
                var currentHP = 0;
                var totalHits = 0;
                var totalXP = 0;
                var totalHpXp = 0;
                var currentHits = 0;
                var xpToAdd = 0;
                var hpXpToAdd = 0;
                var enemyHitChances = 0;
                var damageToPlayer = 0;
                var simSuccess = true;

                var damageToEnemy = 0;
                while (enemyKills < Ntrials && simSuccess) {
                        //Do player attacking enemy
                        currentHP = enemyStats.hitpoints;
                        currentHits = 0
                        while (currentHP > 0) {
                                currentHits++;
                                totalHits++;
                                if (currentHits > Nhitmax) {
                                        simSuccess = false;
                                        break;
                                }
                                if (playerAccuracy > Math.floor(Math.random() * 100)) {
                                        damageToEnemy = Math.floor(Math.random() * playerStats.maxHit) + 1;
                                        if (damageToEnemy > currentHP) {
                                                damageToEnemy = currentHP;
                                        }
                                        currentHP -= damageToEnemy;
                                        //XP calculation
                                        xpToAdd = damageToEnemy * 4;
                                        xpToAdd += Math.floor(xpToAdd * playerStats.xpBonus);
                                        hpXpToAdd = Math.round((damageToEnemy * 1.33) * 100) / 100;
                                        hpXpToAdd += Math.floor(hpXpToAdd * playerStats.xpBonus);

                                        totalHpXp += hpXpToAdd;
                                        if (playerStats.halfXP) {
                                                totalXP += Math.floor(xpToAdd / 2);
                                        } else {
                                                totalXP += xpToAdd;
                                        }
                                }
                        }
                        enemyKills++;
                        //Do enemy attacking player
                        enemyHitChances = Math.floor(currentHits * playerStats.attackSpeed / enemyStats.attackSpeed);
                        for (let i = 0; i < enemyHitChances; i++) {
                                if (enemyAccuracy > Math.floor(Math.random() * 100)) {
                                        damageToPlayer += Math.floor(Math.random() * enemyStats.maxHit) + 1;
                                }
                        }
                }
                //Compute stats from simulation
                this.monsterSimData[monsterID].simSuccess = simSuccess;
                if (simSuccess) {
                        this.monsterSimData[monsterID].avgNumHits = totalHits / Ntrials;
                        this.monsterSimData[monsterID].avgHitDmg = enemyStats.hitpoints * Ntrials / totalHits;
                        this.monsterSimData[monsterID].avgKillTime = enemySpawnTimer + playerStats.attackSpeed * this.monsterSimData[monsterID].avgNumHits;

                        this.monsterSimData[monsterID].hpPerEnemy = damageToPlayer / Ntrials;
                        this.monsterSimData[monsterID].hpPerSecond = this.monsterSimData[monsterID].hpPerEnemy / this.monsterSimData[monsterID].avgKillTime * 1000;
                        this.monsterSimData[monsterID].dmgPerSecond = enemyStats.hitpoints / this.monsterSimData[monsterID].avgKillTime * 1000;
                        this.monsterSimData[monsterID].xpPerEnemy = totalXP / Ntrials;
                        this.monsterSimData[monsterID].xpPerSecond = totalXP / Ntrials / this.monsterSimData[monsterID].avgKillTime * 1000;
                        this.monsterSimData[monsterID].hpxpPerEnemy = totalHpXp / Ntrials;
                        this.monsterSimData[monsterID].hpxpPerSecond = totalHpXp / Ntrials / this.monsterSimData[monsterID].avgKillTime * 1000;
                        this.monsterSimData[monsterID].killTimeS = this.monsterSimData[monsterID].avgKillTime / 1000;
                }
                this.monsterSimData[monsterID].simDone = true;
        }

        resetSimDone() {
                for (let i = 0; i < MONSTERS.length; i++) {
                        this.monsterSimData[i].simDone = false;
                }
        }

        calculateAccuracy(attacker, target) {
                var targetDefRoll = 0;
                if (attacker.attackType == 0) {
                        targetDefRoll = target.maxDefRoll;
                } else if (attacker.attackType == 1) {
                        targetDefRoll = target.maxRngDefRoll;
                } else {
                        targetDefRoll = target.maxMagDefRoll;
                }
                var accuracy = 0;
                if (attacker.maxAttackRoll < targetDefRoll) {
                        accuracy = (0.5 * attacker.maxAttackRoll / targetDefRoll) * 100;
                } else {
                        accuracy = (1 - 0.5 * targetDefRoll / attacker.maxAttackRoll) * 100;
                }
                return accuracy;
        }

        getDataSet(keyValue) {
                var dataSet = [];
                //Compile data from monsters in combat zones
                for (let i = 0; i < combatAreas.length; i++) {
                        for (let j = 0; j < combatAreas[i].monsters.length; j++) {
                                dataSet.push((this.monsterSimData[combatAreas[i].monsters[j]].simSuccess) ? this.monsterSimData[combatAreas[i].monsters[j]][keyValue] : 0)
                        }
                }
                //Perform simulation of monsters in dungeons
                for (let i = 0; i < DUNGEONS.length; i++) {
                        dataSet.push((this.dungeonSimData[i].simSuccess) ? this.dungeonSimData[i][keyValue] : 0)
                }
                return dataSet;
        }
}

class mcsSimPlotOptions {
        /**
         * 
         * @param {mcsApp} parent 
         */
        constructor(parent) {
                this.parent = parent;

                this.plotOptions = ['XP/s', 'HP XP/s', 'HP loss/s', 'Damage/s', 'Average Kill Time', 'Average Hit Damage'];
                this.plotKeys = ['xpPerSecond', 'hpxpPerSecond', 'hpPerSecond', 'dmgPerSecond', 'killTimeS', 'avgHitDmg'];

                this.labelWidth = 100;
                this.dropDownWidth = 175;
                this.editWidth = 120;
                this.dropDownHeight = 25;
                this.fieldWidth = 120;

                this.width = this.labelWidth + this.dropDownWidth + 2;
                //Styles
                this.labelStyle = `height: ${this.dropDownHeight}px;width: ${this.labelWidth}px;text-align: right;vertical-align: text-top;margin-right: 2px;`;
                this.dropDownStyle = `width: ${this.dropDownWidth}px;height: ${this.dropDownHeight}px;text-align: left;`;
                this.optionsStyle = `height: ${this.dropDownHeight}px;vertical-align: text-top;text-align: right;`;
                this.inputStyle = `height: ${this.dropDownHeight}px;width: ${this.fieldWidth}px;text-align: right`;
                this.sectionStyle = `height: ${20}px;font-size: 18px;margin-top: 2px;margin-bottom: 2px;width: ${this.width}px;text-align: center;`;
                //Construct user interface
                this.container = document.createElement('div');
                this.fontSize = 16;
                this.container.setAttribute('style', `height: 100%;width: ${this.width}px;font-size: ${this.fontSize}px;line-height: ${this.dropDownHeight}px;margin-right: 5px;
                display: flex;flex-direction: column;flex-wrap: nowrap;justify-content; flex-start;min-width: ${this.width}px;background: white;`);
                this.container.id = 'MCS Sim Plot Opts';
                this.parent.content.appendChild(this.container);

                var newSection = document.createElement('div');
                newSection.setAttribute('style', this.sectionStyle)
                newSection.textContent = 'Simulation Options';
                this.container.appendChild(newSection);
                //Max Hits Edit
                this.maxHitCont = document.createElement('div');
                this.maxHitCont.setAttribute('style', `height: ${this.dropDownHeight}px;width: ${this.labelWidth + this.fieldWidth + 2}px;`)
                this.container.appendChild(this.maxHitCont);
                this.maxHitLab = document.createElement('label');
                this.maxHitLab.setAttribute('style', this.labelStyle);
                this.maxHitLab.textContent = 'Max Hits:';
                this.maxHitInp = document.createElement('input');
                this.maxHitInp.value = '1000';
                this.maxHitInp.setAttribute('style', this.inputStyle)
                this.maxHitInp.setAttribute('type', 'number');
                this.maxHitInp.setAttribute('min', '1');
                this.maxHitInp.setAttribute('max', '10000');
                this.maxHitInp.addEventListener('change', event => this.callBackMaxHits(event));
                this.maxHitCont.appendChild(this.maxHitLab);
                this.maxHitCont.appendChild(this.maxHitInp);

                //Number of trials edit
                this.numTrialsCont = document.createElement('div');
                this.numTrialsCont.setAttribute('style', `height: ${this.dropDownHeight}px;width: ${this.labelWidth + this.fieldWidth + 2}px;`)
                this.container.appendChild(this.numTrialsCont);
                this.numTrialsLab = document.createElement('label');
                this.numTrialsLab.setAttribute('style', this.labelStyle);
                this.numTrialsLab.textContent = '# Trials:';
                this.numTrialsInp = document.createElement('input');
                this.numTrialsInp.value = '1000';
                this.numTrialsInp.setAttribute('style', this.inputStyle)
                this.numTrialsInp.setAttribute('type', 'number');
                this.numTrialsInp.setAttribute('min', '1');
                this.numTrialsInp.setAttribute('max', '10000');
                this.numTrialsInp.addEventListener('change', event => this.callBacknumTrials(event));
                this.numTrialsCont.appendChild(this.numTrialsLab);
                this.numTrialsCont.appendChild(this.numTrialsInp);

                //Plot type dropdown
                this.plotTypeContainer = document.createElement('div');
                this.plotTypeContainer.setAttribute('style', `height: ${this.dropDownHeight}px;width: ${this.dropDownWidth + this.labelWidth + 2}px;`)
                this.plotTypeLabel = document.createElement('label');
                this.plotTypeLabel.textContent = 'Plot Type:'
                this.plotTypeLabel.setAttribute('style', this.labelStyle);
                this.plotTypeDropDown = document.createElement('select');
                this.plotTypeDropDown.setAttribute('style', this.dropDownStyle);
                this.plotTypeDropDown.addEventListener('change', event => this.callBackPlotType(event));
                this.plotTypeOptions = [];
                for (let i = 0; i < this.plotOptions.length; i++) {
                        this.plotTypeOptions.push(document.createElement('option'));
                        this.plotTypeOptions[i].textContent = this.plotOptions[i];
                        this.plotTypeOptions[i].value = this.plotKeys[i];
                        this.plotTypeOptions[i].setAttribute('style', this.optionsStyle);
                        this.plotTypeDropDown.add(this.plotTypeOptions[i]);
                }

                this.plotTypeContainer.appendChild(this.plotTypeLabel);
                this.plotTypeContainer.appendChild(this.plotTypeDropDown);
                this.container.appendChild(this.plotTypeContainer);

                //Simulate Button
                this.simulateButton = document.createElement('button');
                this.simulateButton.setAttribute('style', `height ${this.dropDownHeight * 2}px;width: ${this.dropDownWidth + this.labelWidth + 2}px;margin-top: 20px`)
                this.simulateButton.appendChild(document.createTextNode('Simulate'));
                this.simulateButton.addEventListener('click', event => this.callBackSimulate(event));
                this.container.appendChild(this.simulateButton);

        }

        callBackMaxHits(event) {
                var newMaxHit = parseInt(event.currentTarget.value);
                if (newMaxHit > 0 && newMaxHit <= 10000) {
                        this.parent.simulator.Nhitmax = newMaxHit;
                }
        }
        callBacknumTrials(event) {
                var newNumTrials = parseInt(event.currentTarget.value);
                if (newNumTrials > 0 && newNumTrials <= 10000) {
                        this.parent.simulator.Ntrials = newNumTrials;
                }
        }
        callBackPlotType(event) {
                this.parent.plotter.updateBars(this.parent.simulator.getDataSet(event.currentTarget.value));
        }
        callBackSimulate(event) {
                this.parent.simulator.simulateCombat();
                this.parent.plotter.updateBars(this.parent.simulator.getDataSet(this.plotTypeDropDown.selectedOptions[0].value));
        }
}

/**
 * @description Baseclass for the cards in the bottom of the ui
 */
class mcsCard {
        /**
         * @description Constructs an instance of mcsCard
         * @param {} parentElement Parent HTML Element to place the card in
         */
        constructor(parentElement, width, height, labelWidth, inputWidth) {
                this.container = document.createElement('div');
                this.container.className = 'mcsCardContainer';
                this.container.style.minWidth = width;
                this.container.style.height = height;
                parentElement.appendChild(this.container);
                this.labelWidth = labelWidth;
                this.inputWidth = inputWidth;
                this.width = width;
                this.height = height;

                this.dropDowns = [];
                this.buttons = [];
                this.numOutputs = [];
        }

        /**
         * @description Creates a new button and appends it to the container. Autoadds callbacks to change colour
         * @param {string} buttonText Text to display on button
         * @param {Function} onclickCallback Callback to excute when pressed
         * @param {number} width Width of button in px
         * @param {number} height Height of button in px
         */
        addButton(buttonText, onclickCallback, width, height) {
                var newButton = document.createElement('button');
                newButton.className = 'mcsButton';
                newButton.style.width = `${width}px`;
                newButton.style.height = `${height}px`;
                newButton.textContent = buttonText;
                newButton.onclick = onclickCallback;
                this.container.appendChild(newButton);
                this.buttons.push(newButton);
        }
        /**
         * 
         * @param {string} labelText 
         * @param {string[]} optionText 
         * @param {any[]} optionValues 
         * @param {number} height 
         */
        addDropdown(labelText, optionText, optionValues, height,onChangeCallback) {
                var dropDownID = `MCS ${labelText} Dropdown`;
                var newCCContainer = this.createCCContainer(height);
                newCCContainer.id = `${dropDownID} Container`;
                newCCContainer.appendChild(this.createLabel(labelText, dropDownID));
                var newDropdown = this.createDropdown(optionText,optionValues,dropDownID,onChangeCallback)
                newCCContainer.appendChild(newDropdown);
                this.container.appendChild(newCCContainer);
        }

        createDropdown(optionText,optionValues,dropDownID,onChangeCallback) {
                var newDropdown = document.createElement('select');
                newDropdown.className = 'mcsDropdown';
                newDropdown.style.width = this.inputWidth;
                newDropdown.id = dropDownID;
                for (let i = 0; i < optionText.length; i++) {
                        let newOption = document.createElement('option');
                        newOption.text = optionText[i];
                        newOption.value = optionValues[i];
                        newDropdown.add(newOption);
                }
                newDropdown.addEventListener('change',onChangeCallback);
                this.dropDowns.push(newDropdown);
                return newDropdown
        }

        addNumberInput(labelText, startValue, height,min,max,onChangeCallback) {
                var inputID = `MCS ${labelText} Input`;
                var newCCContainer = this.createCCContainer(height);
                newCCContainer.appendChild(this.createLabel(labelText,inputID));

                var newInput = document.createElement('input');
                newInput.id = inputID;
                newInput.type = 'number';
                newInput.min = min;
                newInput.max = max;
                newInput.value = startValue;
                newInput.className = 'mcsNumberInput';
                newInput.style.width = this.inputWidth;
                newInput.addEventListener('change',onChangeCallback);
                newCCContainer.appendChild(newInput);
                this.container.appendChild(newCCContainer);
        }

        addNumberOutput(labelText, initialValue, height) {
                var outputID = `MCS ${labelText} Output`;
                var newCCContainer = this.createCCContainer(height);
                newCCContainer.appendChild(this.createLabel(labelText, outputID));

                var newOutput = document.createElement('div');
                newOutput.className = 'mcsNumberOutput';
                newOutput.style.width = this.inputWidth;
                newOutput.value = initialValue;
                newOutput.id = outputID;
                newCCContainer.appendChild(newOutput);

                this.container.appendChild(newCCContainer);
                this.numOutputs.push(newOutput)
        }

        addSectionTitle(titleText) {
                var newSectionTitle = document.createElement('div');
                newSectionTitle.textContent = titleText;
                newSectionTitle.className = 'mcsSectionTitle';
                newSectionTitle.style.width = this.width;

                this.container.appendChild(newSectionTitle);
        }

        createCCContainer(height) {
                var newCCContainer = document.createElement('div');
                newCCContainer.className = 'mcsCCContainer';
                newCCContainer.style.height = `${height}px`;
                return newCCContainer;
        }

        createLabel(labelText, referenceID) {
                var newLabel = document.createElement('label');
                newLabel.className = 'mcsLabel';
                newLabel.style.width = this.labelWidth;
                newLabel.textContent = labelText;
                newLabel.for = referenceID;
                return newLabel;
        }

}
/**
 * @description Formats a number with the specified number of decimals, padding with 0s
 * @param {number} number Number
 * @param {number} numDecimals Number of decimals
 * @returns {string}
 */
function mcsFormatNum(number, numDecimals) {
        var frontStr = Math.trunc(number).toString(10);
        var outStr = number.toString(10);

        if ((number - Math.trunc(number)) == 0) {
                //No decimals
                if (numDecimals > 0) {
                        outStr += '.';
                        outStr = outStr.padEnd(frontStr.length + 1 + numDecimals, '0')
                }
        } else {
                var outStrDec = outStr.length - frontStr.length - 1;

                if (outStrDec > numDecimals) {
                        //Too many decimals remove from string

                        if (numDecimals == 0) {
                                //Determine if we need to round up
                                var roundDigit = outStr.charCodeAt(frontStr.length + 1);
                                if (roundDigit > 52) {
                                        if (outStr.charCodeAt(frontStr.length - 1) == 57) {
                                                //Case when rounding up from a 9
                                                if (frontStr.length < 2) {
                                                        //Case when we need to round to 10
                                                        outStr = '10';
                                                } else {
                                                        outStr = outStr.slice(0, frontStr.length - 2) + String.fromCharCode(outStr.charCodeAt(frontStr.length - 2) + 1) + '0';
                                                }
                                        } else {
                                                outStr = outStr.slice(0, frontStr.length - 1) + String.fromCharCode(outStr.charCodeAt(frontStr.length - 1) + 1);
                                        }
                                } else {
                                        outStr = outStr.slice(0, frontStr.length);
                                }
                        } else {
                                //Determine if we need to round up
                                var roundDigit = outStr.charCodeAt(frontStr.length + numDecimals + 1);
                                if (roundDigit > 52) {
                                        if (outStr.charCodeAt(frontStr.length + numDecimals) == 57) {
                                                //Case when rounding up from a 9
                                                outStr = outStr.slice(0, frontStr.length + numDecimals - 1) + String.fromCharCode(outStr.charCodeAt(frontStr.length + numDecimals - 1) + 1) + '0';
                                        } else {
                                                outStr = outStr.slice(0, frontStr.length + numDecimals) + String.fromCharCode(outStr.charCodeAt(frontStr.length + numDecimals) + 1);
                                        }
                                } else {
                                        outStr = outStr.slice(0, frontStr.length + 1 + numDecimals);
                                }
                        }
                } else if (outStrDec < numDecimals) {
                        //Not enough decimals pad with zeros
                        outStr = outStr.padEnd(frontStr.length + 1 + numDecimals, '0')
                }
        }
        return outStr;
}
var melvorCombatSim = new mcsApp();
//Todo list:
//Fix spell list not updating on import from game
//Add reflect damage
//
//UI Elements Missing:
//Plot Title
//Indicators for bad data values
//Simple Log box to display the optimal xp/s enemy and zone, with the other relevant stats


//Maybe list:
//Ability to save and load gear sets
//Ability to optimize a leveling path
//No spoiler mode (Use item completion)
//Better sorting on equipment dropdowns
//Dark mode (Oof ouch Owie my retinas)