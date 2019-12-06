/*  Melvor Combat Simulator v0.1: Adds a combat simulator to Melvor Idle

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
                this.container.id = 'MCS Container';
                this.container.style.position = 'fixed';
                this.container.style.height = '0px';
                this.container.style.width = `${this.contentWidth}px`;
                this.container.style.bottom = 0;
                this.container.style.right = 0;
                //Construct the content under the tab
                this.content = document.createElement('div')
                this.content.id = 'MCS Content';
                this.content.setAttribute('style', `position: absolute;height: ${this.contentHeight}px;width: ${this.contentWidth}px;bottom: 0px;right: 0px;`)
                this.content.style.background = 'rgb(255,255,255)';
                this.content.style.border = 'solid rgb(0,0,0)';
                //Add plot box
                this.plotter = new mcsPlotter(this, 670, this.contentHeight);
                //Add dropdowns
                this.gearSelecter = new mcsGearSelecter(this);
                //Add statDisplay
                this.statDisplay = new mcsStatReadout(this);
                //Add Simulation Object
                this.simulator = new mcsSimulator(this);
                //Add simulation options
                this.simPlotOpts = new mcsSimPlotOptions(this);
                //Construct the Tab Container
                this.tabContainer = document.createElement('div')
                this.tabContainer.id = 'MCS Tab Container';
                this.tabContainer.style.position = 'absolute';
                this.tabContainer.style.height = '50px';
                this.tabContainer.style.width = `${this.contentWidth}px`;
                this.tabContainer.style.bottom = this.content.style.height;
                this.tabContainer.style.left = 0;
                //Construct the actual Tab
                this.tab = document.createElement('div')
                this.tab.id = 'MCS Tab';
                this.tab.style.position = 'absolute';
                this.tab.style.height = '100%';
                this.tab.style.width = '200px';
                this.tab.style.bottom = 0;
                this.tab.style.right = 0;
                this.tab.style.background = 'rgb(255,255,255)';
                this.tab.style.border = 'solid rgb(0,0,0)';
                this.tab.style.borderBottom = 'none';
                this.tab.onclick = this.tabOnClick;
                //Add Icon to tab
                this.logo = document.createElement('img');
                this.logo.setAttribute('style',`position: absolute;left: 3px;width: 44px;bottom: 3px`)
                this.logo.src = 'assets/media/skills/combat/combat.svg';
                this.tab.appendChild(this.logo);
                this.tabText = document.createElement('div');
                this.tabText.setAttribute('style','position: absolute;left: 50px;width: 150px;text-align: left;bottom: 13px;')
                this.tabText.textContent = 'Combat Simulator';
                this.tab.appendChild(this.tabText);

                //Put Everything together, then add it to the page
                this.tabContainer.appendChild(this.tab);
                this.container.appendChild(this.content);
                this.container.appendChild(this.tabContainer);

                //Check if div already exists, if so delete it
                if (document.contains(document.getElementById('MCS Container'))) {
                        document.getElementById('MCS Container').remove();
                }
                document.body.appendChild(this.container);
                //Push an update to the displays
                this.simulator.computeGearStats();
                this.statDisplay.updateStatFields();
                this.simulator.computeCombatStats();
                this.statDisplay.updateCombatStats();
        }
        tabOnClick() {
                var x = document.getElementById('MCS Content');
                var y = document.getElementById('MCS Tab Container');
                var z = document.getElementById('MCS Container');
                if (x.style.display === 'none') {
                        x.style.display = 'block';
                        y.style.bottom = x.style.height;
                } else {
                        x.style.display = 'none';
                        y.style.bottom = 0;
                }
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

                this.plotContainer = document.createElement('div');
                this.plotContainer.setAttribute('style', `position: absolute;height: ${height}px;width: ${width}px;right: 0;`);
                this.plotBox = document.createElement('div');
                this.plotBox.setAttribute('style', `position: absolute;height: ${this.plotBoxHeight}px;width: ${this.barGap * 2 + this.barWidth * totBars}px;bottom: ${this.xAxisHeight}px;right: 5px;border: thin solid black;`);
                this.plotContainer.appendChild(this.plotBox);
                this.xAxis = document.createElement('div');
                this.xAxis.setAttribute('style', `position: absolute;height: ${this.xAxisHeight}px;width: ${this.barWidth * totBars}px;bottom: 0px;right: ${5 + this.barGap}px;font-size: 16px`)
                this.plotContainer.appendChild(this.xAxis);

                this.yAxis = document.createElement('div');
                this.yAxis.setAttribute('style', `position: absolute;height: ${this.plotBoxHeight}px;width: ${this.yAxisWidth}px;left: 0px;bottom: ${this.xAxisHeight}px;font-size: 16px;`)
                this.plotContainer.appendChild(this.yAxis);

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

class mcsGearSelecter {
        /**
         * 
         * @param {mcsApp} parent 
         */
        constructor(parent) {
                this.labelWidth = 80;
                this.dropDownWidth = 220;
                this.dropDownHeight = 25;
                this.fieldWidth = 120;

                this.width = this.labelWidth + this.dropDownWidth + 2;
                //Construct user interface
                this.parent = parent;
                this.container = document.createElement('div');
                this.fontSize = 16;
                this.container.setAttribute('style', `position: absolute;height: ${this.parent.contentHeight - 5}px;width: ${this.width}px;left: 5px;top: 5px;font-size: ${this.fontSize}px;line-height: ${this.dropDownHeight}px`);
                this.selectedGear = {};
                //Obtain gear
                this.gearSlots = Object.keys(CONSTANTS.equipmentSlot);
                for (let i = 0; i < this.gearSlots.length; i++) {
                        this[this.gearSlots[i]] = this.getGearIds(CONSTANTS.equipmentSlot[this.gearSlots[i]]);
                        //Sets up the gear selected
                        this.selectedGear[this.gearSlots[i]] = 0;
                }
                //Construct dropdowns
                this.dropDownContainers = [];
                this.dropDowns = [];
                this.dropDownLabels = [];
                this.dropDownsOpts = [];
                //Styles:

                this.labelStyle = `position: absolute;width: ${this.labelWidth}px;height: 100%;left: 0px;text-align: right;vertical-align: text-top;`;
                this.dropDownStyle = `position: absolute;width: ${this.dropDownWidth}px;height: 100%;right: 0px;text-align: left;vertical-align: middle;`;
                this.optionsStyle = `height: 100%;vertical-align: text-top;text-align: right;`;

                for (let i = 0; i < this.gearSlots.length; i++) {
                        this.dropDownContainers.push(document.createElement('div'))
                        this.dropDownContainers[i].style.height = `${this.dropDownHeight}px`;
                        this.dropDownContainers[i].style.position = 'absolute';
                        this.dropDownContainers[i].style.top = `${this.dropDownHeight * i}px`;
                        this.dropDownContainers[i].style.width = '100%';

                        this.dropDowns.push(document.createElement('select'));
                        this.dropDowns[i].setAttribute('style', this.dropDownStyle)
                        this.dropDowns[i].id = `MCS ${this.gearSlots[i]} Dropdown`;
                        this.dropDowns[i].addEventListener('change', event => this.updateStats(event, i))

                        this.dropDownsOpts.push([]);
                        this.dropDownsOpts[i].push(document.createElement('option'));
                        this.dropDownsOpts[i][0].value = 0;
                        this.dropDownsOpts[i][0].text = 'None';
                        this.dropDowns[i].add(this.dropDownsOpts[i][0]);
                        for (let j = 0; j < this[this.gearSlots[i]].length; j++) {
                                this.dropDownsOpts[i].push(document.createElement('option'));
                                this.dropDownsOpts[i][j + 1].setAttribute('style', this.optionsStyle)
                                this.dropDownsOpts[i][j + 1].value = this[this.gearSlots[i]][j];
                                this.dropDownsOpts[i][j + 1].text = items[this[this.gearSlots[i]][j]].name;
                                this.dropDowns[i].add(this.dropDownsOpts[i][j + 1]);
                        }
                        this.dropDownLabels.push(document.createElement('label'));
                        this.dropDownLabels[i].htmlFor = `MCS ${this.gearSlots[i]} Dropdown`;
                        this.dropDownLabels[i].textContent = `${this.gearSlots[i]}:`;
                        this.dropDownLabels[i].setAttribute('style', this.labelStyle)
                        this.dropDownContainers[i].appendChild(this.dropDownLabels[i])
                        this.dropDownContainers[i].appendChild(this.dropDowns[i]);
                        this.container.appendChild(this.dropDownContainers[i]);
                }
                //Add level input fields
                this.skillNames = ['Attack:', 'Strength:', 'Defence:', 'Ranged:', 'Magic:'];
                this.skillContainers = [];
                this.skillLabels = [];
                this.skillFields = [];
                for (let i = 0; i < this.skillNames.length; i++) {
                        this.skillContainers.push(document.createElement('div'));
                        this.skillContainers[i].setAttribute('style', `position: absolute;height: ${this.dropDownHeight}px;width: ${this.labelWidth + this.fieldWidth + 2}px;left: 0px;top: ${this.dropDownHeight * (this.gearSlots.length + i)}px;`)
                        this.skillLabels.push(document.createElement('label'));
                        this.skillLabels[i].htmlFor = `MCS ${this.skillNames[i]} Level`;
                        this.skillLabels[i].textContent = this.skillNames[i];
                        this.skillLabels[i].setAttribute('style', this.labelStyle)

                        this.skillFields.push(document.createElement('input'))
                        this.skillFields[i].setAttribute('style', `position: absolute;height: 100%;width: ${this.fieldWidth}px;right: 0px;top: 0px;text-align: right`)
                        this.skillFields[i].value = '1';
                        this.skillFields[i].setAttribute('type', 'number');
                        this.skillFields[i].setAttribute('min', '1');
                        this.skillFields[i].setAttribute('max', '99');
                        this.skillFields[i].id = `MCS ${this.skillNames[i]} Level`;
                        this.skillFields[i].addEventListener('change', event => this.callBackLevel(event, i));

                        this.skillContainers[i].appendChild(this.skillFields[i])
                        this.skillContainers[i].appendChild(this.skillLabels[i])
                        this.container.appendChild(this.skillContainers[i]);
                }
                this.parent.content.appendChild(this.container);
                //Add attack style fields
                //Combat Styles
                this.meleeStyles = ['Stab', 'Slash', 'Block'];
                this.rangedStyles = ['Accurate', 'Rapid', 'Longrange'];
                this.magicStyles = ['Magic', 'Defensive'];
                this.combatStyleContainer = document.createElement('div');
                this.combatStyleContainer.setAttribute('style', `position: absolute;height: ${this.dropDownHeight}px;width: ${this.dropDownWidth + this.labelWidth + 2}px;left: 0px;top: ${this.dropDownHeight * (this.gearSlots.length + this.skillNames.length)}px;`)
                this.combatStyleLabel = document.createElement('label');
                this.combatStyleLabel.textContent = 'Style:'
                this.combatStyleLabel.setAttribute('style', this.labelStyle)

                this.meleeStyleDropDown = document.createElement('select');
                this.meleeStyleDropDown.setAttribute('style', this.dropDownStyle);
                this.meleeOptions = [];
                for (let i = 0; i < this.meleeStyles.length; i++) {
                        this.meleeOptions.push(document.createElement('option'));
                        this.meleeOptions[i].text = this.meleeStyles[i];
                        this.meleeOptions[i].value = i;
                        this.meleeOptions[i].setAttribute('style', this.optionsStyle);
                        this.meleeStyleDropDown.add(this.meleeOptions[i]);
                }
                this.rangedStyleDropDown = document.createElement('select');
                this.rangedStyleDropDown.setAttribute('style', this.dropDownStyle);
                this.rangedOptions = [];
                for (let i = 0; i < this.rangedStyles.length; i++) {
                        this.rangedOptions.push(document.createElement('option'));
                        this.rangedOptions[i].text = this.rangedStyles[i];
                        this.rangedOptions[i].value = i;
                        this.rangedOptions[i].setAttribute('style', this.optionsStyle);
                        this.rangedStyleDropDown.add(this.rangedOptions[i]);
                }
                this.magicStyleDropDown = document.createElement('select');
                this.magicStyleDropDown.setAttribute('style', this.dropDownStyle);
                this.magicOptions = [];
                for (let i = 0; i < this.magicStyles.length; i++) {
                        this.magicOptions.push(document.createElement('option'));
                        this.magicOptions[i].text = this.magicStyles[i];
                        this.magicOptions[i].value = i;
                        this.magicOptions[i].setAttribute('style', this.optionsStyle);
                        this.magicStyleDropDown.add(this.magicOptions[i]);
                }
                this.meleeStyleDropDown.addEventListener('change', event => this.callBackMeleeStyleDropdown(event));
                this.rangedStyleDropDown.addEventListener('change', event => this.callBackRangedStyleDropdown(event));
                this.magicStyleDropDown.addEventListener('change', event => this.callBackMagicStyleDropdown(event));
                this.combatStyleContainer.appendChild(this.combatStyleLabel);
                this.combatStyleContainer.appendChild(this.meleeStyleDropDown);
                this.combatStyleContainer.appendChild(this.rangedStyleDropDown);
                this.combatStyleContainer.appendChild(this.magicStyleDropDown);
                this.container.appendChild(this.combatStyleContainer);
                //Spell Selection UI
                this.spellSelectContainer = document.createElement('div');
                this.spellSelectContainer.setAttribute('style', `position: absolute;height: ${this.dropDownHeight}px;width: ${this.dropDownWidth + this.labelWidth + 2}px;left: 0px;top: ${this.dropDownHeight * (this.gearSlots.length + this.skillNames.length + 1)}px;`)
                this.spellSelectLabel = document.createElement('label');
                this.spellSelectLabel.textContent = 'Spell:'
                this.spellSelectLabel.setAttribute('style', this.labelStyle);
                this.spellSelectDropDown = document.createElement('select');
                this.spellSelectDropDown.setAttribute('style', this.dropDownStyle);
                this.spellSelectDropDown.addEventListener('change', event => this.callBackSpellDropdown(event));
                this.spellOptions = [];
                for (let i = 0; i < SPELLS.length; i++) {
                        this.spellOptions.push(document.createElement('option'));
                        this.spellOptions[i].textContent = SPELLS[i].name;
                        this.spellOptions[i].value = i;
                        this.spellOptions[i].setAttribute('style', this.optionsStyle);
                        this.spellSelectDropDown.add(this.spellOptions[i]);
                }

                this.spellSelectContainer.appendChild(this.spellSelectLabel);
                this.spellSelectContainer.appendChild(this.spellSelectDropDown);
                this.container.appendChild(this.spellSelectContainer);

                this.disableMagicStyle();
                this.disableRangedStyle();
                //Import from game button
                this.importFromGameButton = document.createElement('button');
                this.importFromGameButton.setAttribute('style', `position: absolute;width: ${this.dropDownWidth + this.labelWidth + 2}px;height: ${this.dropDownHeight}px;left: 0px;top: ${this.dropDownHeight * (this.gearSlots.length + this.skillNames.length + 3)}px`)
                this.importFromGameButton.textContent = 'Import Gear from Game';
                this.importFromGameButton.onclick = event => this.callBackImportFromGameButton(event);
                this.container.appendChild(this.importFromGameButton);
        }
        /**
         * @description Callback for import from game button on click. Finds the gear you have in game and sets the sim values to it
         * @param {object} event 
         */
        callBackImportFromGameButton(event) {
                console.log('Importing from game...')
                var gearID = 0;
                for (let i = 0; i < this.gearSlots.length; i++) {
                        gearID = equippedItems[CONSTANTS.equipmentSlot[this.gearSlots[i]]];
                        this.selectedGear[this.gearSlots[i]] = gearID;
                        if (gearID != 0) {
                                for (let j = 0; j < this[this.gearSlots[i]].length; j++) {
                                        if (this[this.gearSlots[i]][j] == gearID) {
                                                this.dropDowns[i].selectedIndex = j + 1;
                                                break;
                                        }
                                }
                        } else {
                                this.dropDowns[i].selectedIndex = 0;
                        }
                        if (i == CONSTANTS.equipmentSlot.Weapon) {
                                if (items[gearID].isTwoHanded) {
                                        this.dropDowns[CONSTANTS.equipmentSlot.Shield].disabled = true;
                                } else {
                                        this.dropDowns[CONSTANTS.equipmentSlot.Shield].disabled = false;
                                }
                                //Change to the correct combat style selector
                                if ((items[gearID].type === 'Ranged Weapon') || items[gearID].isRanged) {
                                        this.disableMagicStyle();
                                        this.disableMeleeStyle();
                                        this.enableRangedStyle();
                                        //Magic
                                } else if (items[gearID].isMagic) {
                                        this.disableRangedStyle();
                                        this.disableMeleeStyle();
                                        this.enableMagicStyle();
                                        //Melee
                                } else {
                                        this.disableMagicStyle();
                                        this.disableRangedStyle();
                                        this.enableMeleeStyle();
                                }

                        }
                }
                //Do check for weapon type

                //Update levels from in game levels
                this.skillFields[0].value = skillLevel[CONSTANTS.skill.Attack];
                this.skillFields[1].value = skillLevel[CONSTANTS.skill.Strength];
                this.skillFields[2].value = skillLevel[CONSTANTS.skill.Defence];
                this.skillFields[3].value = skillLevel[CONSTANTS.skill.Ranged];
                this.skillFields[4].value = skillLevel[CONSTANTS.skill.Magic];

                this.parent.simulator.playerLevels[0] = skillLevel[CONSTANTS.skill.Attack];
                this.parent.simulator.playerLevels[1] = skillLevel[CONSTANTS.skill.Strength];
                this.parent.simulator.playerLevels[2] = skillLevel[CONSTANTS.skill.Defence];
                this.parent.simulator.playerLevels[3] = skillLevel[CONSTANTS.skill.Ranged];
                this.parent.simulator.playerLevels[4] = skillLevel[CONSTANTS.skill.Magic];

                this.parent.simulator.computeGearStats();
                this.parent.statDisplay.updateStatFields();
                this.parent.simulator.computeCombatStats();
                this.parent.statDisplay.updateCombatStats();
        }
        /**
        * @description Parses through an object array and returns a subarray that match the criteria defined by selectionFunc. Also adds a parentIndex key value
        * @param {Object[]} objectArray Array to find elements of
        * @param {Function} selectionFunc Function that operates on a single element of objectArray, must return true or false
        * @returns {Object[]}
        */
        getGearIds(equipmentSlot) {
                var gearIds = [];
                for (let i = 0; i < items.length; i++) {
                        if (items[i].equipmentSlot == equipmentSlot) {
                                gearIds.push(i);
                        }
                }
                return gearIds;
        }

        updateStats(event, i) {
                var itemID = parseInt(event.currentTarget.selectedOptions[0].value);
                this.selectedGear[this.gearSlots[i]] = itemID;
                if (i == CONSTANTS.equipmentSlot.Weapon) {
                        if (items[itemID].isTwoHanded) {
                                this.dropDowns[CONSTANTS.equipmentSlot.Shield].selectedIndex = 0;
                                this.selectedGear.Shield = 0;
                                console.log(this.selectedGear)
                                this.dropDowns[CONSTANTS.equipmentSlot.Shield].disabled = true;
                        } else {
                                this.dropDowns[CONSTANTS.equipmentSlot.Shield].disabled = false;
                        }
                        //Change to the correct combat style selector
                        if ((items[itemID].type === 'Ranged Weapon') || items[itemID].isRanged) {
                                this.disableMagicStyle();
                                this.disableMeleeStyle();
                                this.enableRangedStyle();
                                //Magic
                        } else if (items[itemID].isMagic) {
                                this.disableRangedStyle();
                                this.disableMeleeStyle();
                                this.enableMagicStyle();
                                //Melee
                        } else {
                                this.disableMagicStyle();
                                this.disableRangedStyle();
                                this.enableMeleeStyle();
                        }

                }
                this.parent.simulator.computeGearStats();
                this.parent.statDisplay.updateStatFields();
                this.parent.simulator.computeCombatStats();
                this.parent.statDisplay.updateCombatStats();
        }
        disableMeleeStyle() {
                this.meleeStyleDropDown.disabled = true;
                this.meleeStyleDropDown.style.display = 'none';
        }
        disableRangedStyle() {
                this.rangedStyleDropDown.disabled = true;
                this.rangedStyleDropDown.style.display = 'none';
        }
        disableMagicStyle() {
                this.magicStyleDropDown.disabled = true;
                this.magicStyleDropDown.style.display = 'none';
                this.spellSelectContainer.style.display = 'none';
        }
        enableMeleeStyle() {
                this.meleeStyleDropDown.disabled = false;
                this.meleeStyleDropDown.style.display = 'block';
        }
        enableRangedStyle() {
                this.rangedStyleDropDown.disabled = false;
                this.rangedStyleDropDown.style.display = 'block';
        }
        enableMagicStyle() {
                this.magicStyleDropDown.disabled = false;
                this.magicStyleDropDown.style.display = 'block';
                this.spellSelectContainer.style.display = 'block';
        }
        /**
         * @description Callback for when the level has been changed
         * @param {object} event 
         * @param {number} i 
         */
        callBackLevel(event, i) {
                var newLevel = parseInt(event.currentTarget.value);
                if (newLevel <= 99 && newLevel >= 1) {
                        this.parent.simulator.playerLevels[i] = newLevel;
                        //This is the magic dropdown that has been changed, update spell list
                        if (i == 4) {
                                this.updateSpellOptions();
                        }
                }
                this.parent.simulator.computeCombatStats();
                this.parent.statDisplay.updateCombatStats();
        }
        callBackMeleeStyleDropdown(event) {
                this.parent.simulator.meleeStyle = event.currentTarget.selectedIndex;
                this.parent.simulator.computeCombatStats();
                this.parent.statDisplay.updateCombatStats();

        }
        callBackRangedStyleDropdown(event) {
                this.parent.simulator.rangedStyle = event.currentTarget.selectedIndex;
                this.parent.simulator.computeCombatStats();
                this.parent.statDisplay.updateCombatStats();

        }
        callBackMagicStyleDropdown(event) {
                this.parent.simulator.magicStyle = event.currentTarget.selectedIndex;
                this.parent.simulator.computeCombatStats();
                this.parent.statDisplay.updateCombatStats();

        }
        callBackSpellDropdown(event) {
                this.parent.simulator.selectedSpell = event.currentTarget.selectedIndex;
                this.parent.simulator.computeCombatStats();
                this.parent.statDisplay.updateCombatStats();
        }
        updateSpellOptions() {
                var magicLevel = this.parent.simulator.playerLevels[4];
                for (let i = 0; i < SPELLS.length; i++) {
                        if (magicLevel >= SPELLS[i].magicLevelRequired) {
                                this.spellOptions[i].style.display = 'block';
                        } else {
                                this.spellOptions[i].style.display = 'none';
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

                this.parent = parent;
                this.container = document.createElement('div');
                this.container.setAttribute('style', `position: absolute;top: 5px;width: ${this.statWidth}px;left: ${10 + this.parent.gearSelecter.width}px;font-size: 16px;line-height: ${this.statHeight}px;`)

                this.statContainers = [];
                this.statImages = [];
                this.statLabels = [];
                this.statFields = [];
                for (let i = 0; i < this.statNames.length; i++) {
                        this.statContainers.push(document.createElement('div'));
                        this.statContainers[i].style.position = 'absolute';
                        this.statContainers[i].style.width = `${this.statWidth}px`;
                        this.statContainers[i].style.height = `${this.statHeight}px`;
                        this.statContainers[i].style.top = `${this.statHeight * i}px`;
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
                        this.combatStatContainers[i].setAttribute('style', `position: absolute;width: ${this.statWidth}px;height: ${this.statHeight}px;top: ${this.statHeight * (this.statKeys.length + i + 1)}px;`)
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
}

class mcsSimulator {
        /**
         * 
         * @param {mcsApp} parent 
         */
        constructor(parent) {
                this.parent = parent;
                //Player combat stats
                this.playerLevels = [1, 1, 1, 1, 1];
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
                this.rangedStyle = 0;
                this.meleeStyle = 0;
                this.magicStyle = 0;

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
                for (let i = 0; i < this.parent.gearSelecter.gearSlots.length; i++) {
                        var itemID = this.parent.gearSelecter.selectedGear[this.parent.gearSelecter.gearSlots[i]];
                        if (itemID == -1) {
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
                var weaponID = this.parent.gearSelecter.selectedGear.Weapon;
                //Ranged
                if ((items[weaponID].type === 'Ranged Weapon') || items[weaponID].isRanged) {
                        this.attackType = 1;
                        if (this.rangedStyle == 0) {
                                attackStyleBonus += 3;
                                this.attackSpeed = this.eqpAttSpd;
                        } else if (this.rangedStyle == 1) {
                                this.attSpd = this.eqpAttSpd - 400;
                        } else {
                                meleeDefenceBonus += 3;
                                this.attSpd = this.eqpAttSpd;
                        }
                        var effectiveAttackLevel = Math.floor(this.playerLevels[3] + 8 + attackStyleBonus);
                        this.maxAttackRoll = effectiveAttackLevel * (this.rngAttBon + 64);

                        var effectiveStrengthLevel = Math.floor(this.playerLevels[3] + attackStyleBonus);
                        this.maxHit = Math.floor(1.3 + effectiveStrengthLevel / 10 + this.rngStrBon / 80 + effectiveStrengthLevel * this.rngStrBon / 640);
                        //Magic
                } else if (items[weaponID].isMagic) {
                        this.attackType = 2;
                        effectiveAttackLevel = Math.floor(this.playerLevels[4] + 8 + attackStyleBonus);
                        this.maxAttackRoll = effectiveAttackLevel * (this.magAttBon + 64);
                        this.maxHit = Math.floor(SPELLS[this.selectedSpell].maxHit + (SPELLS[this.selectedSpell].maxHit * (this.magDmgBon / 100)));
                        //Melee
                } else {
                        this.attackType = 0;
                        effectiveAttackLevel = Math.floor(this.playerLevels[0] + 8 + attackStyleBonus);
                        this.maxAttackRoll = effectiveAttackLevel * (this.attBon[this.meleeStyle] + 64);

                        effectiveStrengthLevel = Math.floor(this.playerLevels[1] + 8 + 1);
                        this.maxHit = Math.floor(1.3 + effectiveStrengthLevel / 10 + this.strBon / 80 + effectiveStrengthLevel * this.strBon / 640);
                }
                var effectiveDefenceLevel = Math.floor(this.playerLevels[2] + 8 + meleeDefenceBonus);
                this.maxDefRoll = effectiveDefenceLevel * (this.defBon + 64);
                var effectiveRngDefenceLevel = Math.floor(this.playerLevels[2] + 8 + 1);
                this.maxRngDefRoll = effectiveRngDefenceLevel * (this.rngDefBon + 64);
                var effectiveMagicDefenceLevel = Math.floor(Math.floor(this.playerLevels[4] * 0.7) + Math.floor(this.playerLevels[2] * 0.3) + 8 + 1);
                this.maxMagDefRoll = effectiveMagicDefenceLevel * (this.magDefBon + 64);

                if (weaponID != -1) {
                        this.attackSpeed = this.eqpAttSpd;
                }
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
                if (this.parent.gearSelecter.selectedGear.Ring == CONSTANTS.item.Gold_Emerald_Ring) {
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
                this.labelStyle = `position: absolute;width: ${this.labelWidth}px;height: 100%;left: 0px;text-align: right;vertical-align: text-top;`;
                this.dropDownStyle = `position: absolute;width: ${this.dropDownWidth}px;height: 100%;right: 0px;text-align: left;vertical-align: middle;`;
                this.optionsStyle = `height: 100%;vertical-align: text-top;text-align: right;`;
                this.inputStyle = `position: absolute;height: 100%;width: ${this.fieldWidth}px;right: 0px;top: 0px;text-align: right`;
                //Construct user interface
                this.container = document.createElement('div');
                this.fontSize = 16;
                this.container.setAttribute('style', `position: absolute;height: ${this.parent.contentHeight - 5}px;width: ${this.width}px;left: ${15 + this.parent.statDisplay.statWidth + this.parent.gearSelecter.width}px;top: 5px;font-size: ${this.fontSize}px;line-height: ${this.dropDownHeight}px`);
                this.parent.content.appendChild(this.container);

                //Max Hits Edit
                this.maxHitCont = document.createElement('div');
                this.maxHitCont.setAttribute('style', `position: absolute;height: ${this.dropDownHeight}px;width: ${this.labelWidth + this.fieldWidth + 2}px;left: 0px;top: 0px;`)
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
                this.maxHitCont.appendChild(this.maxHitInp);
                this.maxHitCont.appendChild(this.maxHitLab);

                //Number of trials edit
                this.numTrialsCont = document.createElement('div');
                this.numTrialsCont.setAttribute('style', `position: absolute;height: ${this.dropDownHeight}px;width: ${this.labelWidth + this.fieldWidth + 2}px;left: 0px;top: ${this.dropDownHeight}px;`)
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
                this.numTrialsCont.appendChild(this.numTrialsInp);
                this.numTrialsCont.appendChild(this.numTrialsLab);

                //Plot type dropdown
                this.plotTypeContainer = document.createElement('div');
                this.plotTypeContainer.setAttribute('style', `position: absolute;height: ${this.dropDownHeight}px;width: ${this.dropDownWidth + this.labelWidth + 2}px;left: 0px;top: ${this.dropDownHeight * 2}px;`)
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
                this.simulateButton.setAttribute('style', `position: absolute;height ${this.dropDownHeight * 2}px;width: ${this.dropDownWidth + this.labelWidth + 2}px;left: 0px;top: ${this.dropDownHeight * 3}px;`)
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