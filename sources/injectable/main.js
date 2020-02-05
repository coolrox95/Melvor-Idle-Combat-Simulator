/*  Melvor Combat Simulator v0.4.2: Adds a combat simulator to Melvor Idle

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

class mcsApp {
        constructor() {
                //Generate gear subsets
                this.slotKeys = Object.keys(CONSTANTS.equipmentSlot);
                this.gearSubsets = [];
                this.gearSelected = [];
                for (let j = 0; j < this.slotKeys.length; j++) {
                        this.gearSubsets.push([{ name: 'None', itemID: 0 }]);
                        this.gearSelected.push(0);
                        for (let i = 0; i < items.length; i++) {
                                if (items[i].equipmentSlot == CONSTANTS.equipmentSlot[this.slotKeys[j]]) {
                                        this.gearSubsets[j].push(items[i]);
                                        this.gearSubsets[j][this.gearSubsets[j].length - 1].itemID = i;
                                }
                        }
                        //Insert Sorting of subsets here
                        this.gearSubsets[j].sort((a, b) => { return ((a.attackLevelRequired) ? a.attackLevelRequired : 0) - ((b.attackLevelRequired) ? b.attackLevelRequired : 0) });
                        this.gearSubsets[j].sort((a, b) => { return ((a.defenceLevelRequired) ? a.defenceLevelRequired : 0) - ((b.defenceLevelRequired) ? b.defenceLevelRequired : 0) });
                        this.gearSubsets[j].sort((a, b) => { return ((a.rangedLevelRequired) ? a.rangedLevelRequired : 0) - ((b.rangedLevelRequired) ? b.rangedLevelRequired : 0) });
                        this.gearSubsets[j].sort((a, b) => { return ((a.magicLevelRequired) ? a.magicLevelRequired : 0) - ((b.magicLevelRequired) ? b.magicLevelRequired : 0) });
                }
                this.skillKeys = ['Attack', 'Strength', 'Defence', 'Ranged', 'Magic', 'Prayer', 'Slayer'];
                //Simulation Object
                this.simulator = new mcsSimulator(this);
                //Temporary GP/s settings variable
                this.itemSubsetTemp = [];

                //Create the container for the main content
                this.content = document.createElement('div')
                this.content.className = 'mcsTabContent'
                this.content.id = 'MCS Content';
                this.content.style.display = 'none';

                //This code will insert a tab into the actual sidebar
                var newHeading = document.createElement('li');
                newHeading.className = 'nav-main-heading';
                newHeading.textContent = 'Tools';
                var elem1 = document.createElement('li');
                elem1.className = 'nav-main-item';

                document.getElementsByClassName('nav-main-heading').forEach(heading => {
                        if (heading.textContent == 'Skills') {
                                heading.parentElement.insertBefore(newHeading, heading);
                                heading.parentElement.insertBefore(elem1, heading);
                        }
                })
                var elem2 = document.createElement('a');
                elem2.className = 'nav-main-link nav-compact';
                elem2.href = 'javascript:melvorCombatSim.tabOnClick();';
                elem1.appendChild(elem2);
                var elem3 = document.createElement('img');
                elem3.className = 'nav-img';
                elem3.src = 'assets/media/skills/combat/combat.svg';
                elem2.appendChild(elem3);
                var elem4 = document.createElement('span');
                elem4.className = 'nav-main-link-name';
                elem4.textContent = 'Combat Simulator';
                elem2.appendChild(elem4);

                //Add Cards to the container
                //Add Filler Card
                this.cardFiller = document.createElement('div');
                this.cardFiller.className = 'mcsFlexFiller';
                this.content.appendChild(this.cardFiller);
                //Gear/Level/Style/Spell Selection Card:
                {
                        this.gearSelecter = new mcsCard(this.content, '345px', '100%', '120px', '220px');
                        this.gearSelecter.addSectionTitle('Equipment');
                        for (let i = 0; i < this.gearSubsets.length; i++) {
                                let optionNames = [];
                                let optionValues = [];
                                this.gearSubsets[i].forEach(item => { optionNames.push(item.name); optionValues.push(item.itemID); });
                                this.gearSelecter.addDropdown(this.slotKeys[i], optionNames, optionValues, 25, event => this.gearDropdownOnChange(event, i));
                        }
                        this.gearSelecter.addSectionTitle('Player Levels');
                        this.skillKeys.forEach(element => {
                                this.gearSelecter.addNumberInput(element, '1', 25, 1, 99, event => this.levelInputOnChange(event, element))
                        });
                        this.gearSelecter.addSectionTitle('Combat Style')
                        //Style dropdown (Specially Coded)
                        var combatStyleCCContainer = this.gearSelecter.createCCContainer(25);
                        var combatStyleLabel = this.gearSelecter.createLabel('Style: ', '');
                        var meleeStyleDropdown = this.gearSelecter.createDropdown(['Stab', 'Slash', 'Block'], [0, 1, 2], 'MCS Melee Style Dropdown', event => this.styleDropdownOnChange(event, 'Melee'));
                        var rangedStyleDropdown = this.gearSelecter.createDropdown(['Accurate', 'Rapid', 'Longrange'], [0, 1, 2], 'MCS Ranged Style Dropdown', event => this.styleDropdownOnChange(event, 'Ranged'));
                        var magicStyleDropdown = this.gearSelecter.createDropdown(['Magic', 'Defensive'], [0, 1], 'MCS Magic Style Dropdown', event => this.styleDropdownOnChange(event, 'Magic'));
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
                        for (let i = 0; i < SPELLS.length; i++) {
                                spellOpts.push(SPELLS[i].name);
                                spellVals.push(i);
                        }
                        this.gearSelecter.addDropdown('Spell', spellOpts, spellVals, 25, event => this.spellDropdownOnChange(event));
                        this.gearSelecter.addButton('Import from Game', event => this.importButtonOnClick(event), 280, 25)
                }
                //Prayer Selection Card:
                {
                        this.prayerSelecter = new mcsCard(this.content, '200px', '100%', '100px', '100px');
                        this.prayerSelecter.addSectionTitle('Prayers');
                        let prayerSources = [];
                        let prayerNames = [];
                        let prayerCallbacks = [];
                        for (let i = 0; i < PRAYER.length; i++) {
                                prayerSources.push(PRAYER[i].media);
                                prayerNames.push(PRAYER[i].name);
                                prayerCallbacks.push(e => this.prayerButtonOnClick(e, i));
                        }
                        let prayerTooltips = this.prayerSelecter.addMultiImageButton(prayerSources, prayerNames, 24, 24, prayerCallbacks);
                        //Generate the tooltip contents
                        let prayerBonusDictionary = {
                                prayerBonusAttack: 'Melee Accuracy',
                                prayerBonusStrength: 'Melee Strength',
                                prayerBonusDefence: 'Melee Evasion',
                                prayerBonusAttackRanged: 'Ranged Accuracy',
                                prayerBonusStrengthRanged: 'Ranged Strength',
                                prayerBonusDefenceRanged: 'Ranged Evasion',
                                prayerBonusAttackMagic: 'Magic Accuracy',
                                prayerBonusDamageMagic: 'Magic Damage',
                                prayerBonusDefenceMagic: 'Magic Evasion',
                                prayerBonusProtectItem: 'Keep item on death',
                                prayerBonusHitpoints: '2x Restore Rate for Hitpoints',
                                prayerBonusProtectFromMelee: '95% chance to dodge Melee Attacks',
                                prayerBonusProtectFromRanged: '95% chance to dodge Ranged Attacks',
                                prayerBonusProtectFromMagic: '95% chance to dodge Magic Attacks',
                                prayerBonusHitpointHeal: 'Heal +20% HP when HP falls below 10%',
                        }
                        let prayerBonusNumeric = {
                                prayerBonusAttack: true,
                                prayerBonusStrength: true,
                                prayerBonusDefence: true,
                                prayerBonusAttackRanged: true,
                                prayerBonusStrengthRanged: true,
                                prayerBonusDefenceRanged: true,
                                prayerBonusAttackMagic: true,
                                prayerBonusDamageMagic: true,
                                prayerBonusDefenceMagic: true,
                                prayerBonusProtectItem: false,
                                prayerBonusHitpoints: false,
                                prayerBonusProtectFromMelee: false,
                                prayerBonusProtectFromRanged: false,
                                prayerBonusProtectFromMagic: false,
                                prayerBonusHitpointHeal: false,
                        }
                        for (let i = 0; i < PRAYER.length; i++) {
                                let tipTitle = document.createElement('span');
                                tipTitle.className = 'mcsTTTitle';
                                tipTitle.textContent = PRAYER[i].name;
                                prayerTooltips[i].appendChild(tipTitle);
                                let div1 = document.createElement('div');
                                div1.className = 'mcsTTDivider';
                                prayerTooltips[i].appendChild(div1);
                                for (let j = 0; j < PRAYER[i].vars.length; j++) {
                                        let bonusText = document.createElement('span');
                                        bonusText.className = 'mcsTTText';
                                        let prayerBonus = PRAYER[i].vars[j];
                                        if (prayerBonusNumeric[prayerBonus]) {
                                                bonusText.textContent = `+${PRAYER[i].values[j]}% ${prayerBonusDictionary[prayerBonus]}`;
                                        } else {
                                                bonusText.textContent = prayerBonusDictionary[prayerBonus];
                                        }
                                        prayerTooltips[i].appendChild(bonusText);
                                        prayerTooltips[i].appendChild(document.createElement('br'));
                                }
                                if (PRAYER[i].pointsPerPlayer > 0) {
                                        let prayerXPBonus = document.createElement('span');
                                        prayerXPBonus.className = 'mcsTTText';
                                        prayerXPBonus.textContent = `+${(2 / numberMultiplier * PRAYER[i].pointsPerPlayer).toFixed(2)} prayer xp per damage done`;
                                        prayerTooltips[i].appendChild(prayerXPBonus);
                                }
                                let div2 = document.createElement('div');
                                div2.className = 'mcsTTDivider';
                                prayerTooltips[i].appendChild(div2);
                                //Prayer point costs
                                if (PRAYER[i].pointsPerEnemy > 0) {
                                        let prayerCost = document.createElement('span');
                                        prayerCost.className = 'mcsTTText';
                                        prayerCost.textContent = `Costs: ${PRAYER[i].pointsPerEnemy} per enemy attack`;
                                        prayerTooltips[i].appendChild(prayerCost);
                                }
                                if (PRAYER[i].pointsPerPlayer > 0) {
                                        let prayerCost = document.createElement('span');
                                        prayerCost.className = 'mcsTTText';
                                        prayerCost.textContent = `Costs: ${PRAYER[i].pointsPerPlayer} per player attack`;
                                        prayerTooltips[i].appendChild(prayerCost);
                                }
                                if (PRAYER[i].pointsPerRegen > 0) {
                                        let prayerCost = document.createElement('span');
                                        prayerCost.className = 'mcsTTText';
                                        prayerCost.textContent = `Costs: ${PRAYER[i].pointsPerRegen} per HP regen`;
                                        prayerTooltips[i].appendChild(prayerCost);
                                }
                        }

                }
                //Gear Stats/Player Stats Display Card
                {
                        this.statDisplay = new mcsCard(this.content, '220px', '100%', '150px', '50px');
                        this.statDisplay.addSectionTitle('Equipment Stats');
                        this.equipStatKeys = ['eqpAttSpd', 'strBon', 'attBon0', 'attBon1', 'attBon2', 'rngAttBon', 'rngStrBon', 'magAttBon', 'magDmgBon', 'defBon', 'eqpDmgRed', 'rngDefBon', 'magDefBon', 'attReq', 'defReq', 'rngReq', 'magReq'];
                        var equipStatNames = ['Attack Speed', 'Strength Bonus', 'Stab Bonus', 'Slash Bonus', 'Block Bonus', 'Attack Bonus', 'Strength Bonus', 'Attack Bonus', '% Damage Bonus', 'Defence Bonus', 'Damage Reduction', 'Defence Bonus', 'Defence Bonus', 'Level Required', 'Level Required', 'Level Required', 'Level Required'];
                        var equipStatIcons = ['combat', 'strength', 'attack', 'strength', 'defence', 'ranged', 'ranged', 'magic', 'magic', 'defence', 'defence', 'ranged', 'magic', 'attack', 'defence', 'ranged', 'magic']
                        var iconSources = {
                                combat: 'assets/media/skills/combat/combat.svg',
                                attack: 'assets/media/skills/combat/attack.svg',
                                strength: 'assets/media/skills/combat/strength.svg',
                                ranged: 'assets/media/skills/ranged/ranged.svg',
                                magic: 'assets/media/skills/magic/magic.svg',
                                defence: 'assets/media/skills/defence/defence.svg'
                        };
                        for (let i = 0; i < equipStatNames.length; i++) {
                                this.statDisplay.addNumberOutput(equipStatNames[i], 0, 20, iconSources[equipStatIcons[i]], `MCS ${this.equipStatKeys[i]} Output`);
                        }
                        this.statDisplay.addSectionTitle('Combat Stats');
                        var combatStatNames = ['Attack Speed', 'Max Hit', 'Accuracy Rating', 'Evasion Rating', 'Evasion Rating', 'Evasion Rating', 'Damage Reduction'];
                        var combatStatIcons = ['', '', '', 'combat', 'ranged', 'magic', '']
                        this.combatStatKeys = ['attackSpeed', 'maxHit', 'maxAttackRoll', 'maxDefRoll', 'maxRngDefRoll', 'maxMagDefRoll', 'dmgRed'];
                        for (let i = 0; i < combatStatNames.length; i++) {
                                this.statDisplay.addNumberOutput(combatStatNames[i], 0, 20, (combatStatIcons[i] != '') ? iconSources[combatStatIcons[i]] : '', `MCS ${this.combatStatKeys[i]} Output`);
                        }
                }
                //Simulation/Plot Options Card
                {
                        this.simPlotOpts2 = new mcsCard(this.content, '275px', '100%', '100px', '150px');
                        this.simPlotOpts2.addSectionTitle('Simulation Options');
                        this.simPlotOpts2.addNumberInput('Max Hits', 1000, 25, 1, 10000, event => this.maxhitsInputOnChange(event));
                        this.simPlotOpts2.addNumberInput('# Trials', 1000, 25, 1, 100000, event => this.numtrialsInputOnChange(event));
                        this.plotTypeDropdownOptions = ['XP per second', 'HP XP per second', 'Prayer XP per second', 'Slayer XP per second', 'XP per Attack', 'HP Loss per second', 'Prayer Points per second', 'Damage per second', 'Average Kill Time (s)', 'Damage per Attack', 'GP per Kill', 'GP per Second'];
                        this.plotTypeDropdownValues = ['xpPerSecond', 'hpxpPerSecond', 'prayerXpPerSecond', 'slayerXpPerSecond', 'xpPerHit', 'hpPerSecond', 'ppConsumedPerSecond', 'dmgPerSecond', 'killTimeS', 'avgHitDmg', 'gpPerKill', 'gpPerSecond'];
                        this.simPlotOpts2.addDropdown('Plot Type', this.plotTypeDropdownOptions, this.plotTypeDropdownValues, 25, event => this.plottypeDropdownOnChange(event));
                        this.simPlotOpts2.addRadio('Slayer Task?', 25, 'slayerTask', ['Yes', 'No'], [e => this.slayerTaskRadioOnChange(e, true), e => this.slayerTaskRadioOnChange(e, false)], 1)
                        this.simPlotOpts2.addButton('Simulate', event => this.simulateButtonOnClick(event), 250, 25);
                        this.simPlotOpts2.addSectionTitle('GP/s Options');
                        this.simPlotOpts2.addRadio('Sell Bones', 25, 'sellBones', ['Yes', 'No'], [e => this.sellBonesRadioOnChange(e, true), e => this.sellBonesRadioOnChange(e, false)], 1);
                        this.simPlotOpts2.addDropdown('Sell Loot', ['All', 'Subset', 'None'], ['All', 'Subset', 'None'], 25, e => this.sellLootDropdownOnChange(e));
                        this.simPlotOpts2.addButton('Edit Subset', e => this.editSubsetButtonOnClick(e), 250, 25);
                }
                //GP/s options card
                {
                        this.gpOptionsCard = new mcsCard(this.content, '320px', '100%', '100px', '200px');
                        this.gpOptionsCard.addSectionTitle('Item Subset Selection');
                        this.gpOptionsCard.addMultiButton(['Set Default', 'Set Discovered'], 25, 150, [e => this.setDefaultOnClick(e), e => this.setDiscoveredOnClick(e)]);
                        this.gpOptionsCard.addMultiButton(['Cancel', 'Save'], 25, 150, [e => this.cancelSubsetOnClick(e), e => this.saveSubsetOnClick(e)]);
                        this.gpOptionsCard.addTextInput('Search:', '', 25, e => this.searchInputOnInput(e));
                        //Top labels
                        var labelCont = document.createElement('div');
                        labelCont.className = 'mcsMultiButtonContainer';
                        labelCont.style.borderBottom = 'solid thin';
                        var lab1 = document.createElement('div');
                        lab1.className = 'mcsMultiHeader';
                        lab1.style.borderRight = 'solid thin';
                        lab1.textContent = 'Item';
                        lab1.style.width = '220px';
                        labelCont.appendChild(lab1);
                        var lab2 = document.createElement('div');
                        lab2.className = 'mcsMultiHeader';
                        lab2.textContent = 'Sell?';
                        lab2.style.width = '100px';
                        lab2.style.marginRight = '17px';
                        labelCont.appendChild(lab2);
                        this.gpOptionsCard.container.appendChild(labelCont);
                        this.gpSearchResults = new mcsCard(this.gpOptionsCard.container, '100%', '', '', '100px');
                        for (let i = 0; i < this.simulator.lootList.length; i++) {
                                this.gpSearchResults.addRadio(this.simulator.lootList[i].name, 20, `${this.simulator.lootList[i].name}-radio`, ['Yes', 'No'], [e => this.lootListRadioOnChange(e, i, true), e => this.lootListRadioOnChange(e, i, false)], 1);
                        }
                        this.gpSearchResults.container.style.overflowY = 'scroll';
                        this.gpSearchResults.container.style.overflowX = 'hidden';
                        this.gpSearchResults.container.style.marginRight = '0px';
                        this.gpSearchResults.container.style.marginBottom = '5px';

                        this.gpOptionsCard.container.style.display = 'none';
                }
                //Bar Chart Card
                this.plotter = new mcsPlotter(this);
                //Individual info card, nested into sim/plot card
                {
                        this.zoneInfoCard = new mcsCard(this.simPlotOpts2.container, '100%', '', '100px', '100px');
                        this.zoneInfoCard.addSectionTitle('Area Information', 'MCS Zone Info Title');
                        this.zoneInfoCard.addNumberOutput('Name', 'N/A', 20, '', `MCS Zone Name Output`);
                        var zoneInfoNames = ['XP/s', 'HP XP/s', 'Prayer XP/s', 'Slayer XP/s', 'XP/attack', 'HP Lost/s', 'Prayer Points/s', 'Damage/s', 'Kill Time(s)', 'Damage/attack', 'GP/kill', 'GP/s'];
                        for (let i = 0; i < this.plotTypeDropdownOptions.length; i++) {
                                this.zoneInfoCard.addNumberOutput(zoneInfoNames[i], 'N/A', 20, '', `MCS ${this.plotTypeDropdownValues[i]} Output`);
                        }
                        // this.zoneInfoCard.addButton('Inspect Monster', e => this.inspectMonsterOnClick(e), 250, 25);
                        this.selectedBar = 0;
                        this.barSelected = false;
                        for (let i = 0; i < this.plotter.bars.length; i++) {
                                this.plotter.bars[i].onclick = (e => this.barOnClick(e, i));
                        }
                        this.barMonsterIDs = [];
                        this.barIsDungeon = [];
                        combatAreas.forEach(area => {
                                area.monsters.forEach(monster => {
                                        this.barMonsterIDs.push(monster);
                                        this.barIsDungeon.push(false);
                                })
                        })
                        for (let i = 0; i < DUNGEONS.length; i++) {
                                this.barMonsterIDs.push(i);
                                this.barIsDungeon.push(true);
                        }
                }
                //Now that everything is done we add it to the document
                var filler = document.createElement('div');
                filler.className = 'mcsFlexFiller';
                document.getElementById('main-container').appendChild(filler);
                document.getElementById('main-container').appendChild(this.content);
                //document.body.appendChild(this.container);
                //Push an update to the displays
                document.getElementById('MCS Spell Dropdown Container').style.display = 'none';
                document.getElementById('MCS Edit Subset Button').style.display = 'none';
                this.simulator.computeGearStats();
                this.updateEquipStats();
                this.simulator.computeCombatStats();
                this.updateCombatStats();
                if (darkMode) {
                        this.darkModeSwitch(true);
                } else {
                        this.darkModeSwitch(false);
                }
                this.plotter.updateBars(this.simulator.getDataSet('xpPerSecond'));
                //Add hooks into darkmode buttons
                document.getElementById('setting-darkmode-enable').addEventListener('click', event => this.darkModeSwitch(true, event));
                document.getElementById('setting-darkmode-disable').addEventListener('click', event => this.darkModeSwitch(false, event));

                //Saving and loading of Gear Sets
                this.gearSets = [];
        }
        tabOnClick() {
                var x = document.getElementById('MCS Content');
                if (x.style.display === 'none') {
                        x.style.display = 'flex';
                } else {
                        x.style.display = 'none';
                }
        }
        //Callback Functions for Gear select Card
        gearDropdownOnChange(event, gearID) {
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
                this.updateEquipStats();
                this.simulator.computeCombatStats();
                this.updateCombatStats();
        }
        levelInputOnChange(event, skillName) {
                var newLevel = parseInt(event.currentTarget.value);
                if (newLevel <= 99 && newLevel >= 1) {
                        this.simulator.playerLevels[skillName] = newLevel;
                        //This is the magic dropdown that has been changed, update spell list
                        if (skillName == 'Magic') {
                                this.updateSpellOptions(newLevel);
                        }
                        if (skillName == 'Prayer') {
                                this.updatePrayerOptions(newLevel);
                        }
                }
                this.simulator.computeCombatStats();
                this.updateCombatStats();
        }
        styleDropdownOnChange(event, combatType) {
                var styleID = parseInt(event.currentTarget.selectedOptions[0].value);
                this.simulator.styles[combatType] = styleID;
                this.simulator.computeCombatStats();
                this.updateCombatStats();
        }
        spellDropdownOnChange(event) {
                var spellID = parseInt(event.currentTarget.selectedOptions[0].value);
                this.simulator.selectedSpell = spellID;
                this.simulator.computeCombatStats();
                this.updateCombatStats();
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
                        document.getElementById('MCS Ranged Style Dropdown').selectedIndex = attackStyle - 3;
                } else {
                        this.simulator.styles.Magic = attackStyle - 6;
                        document.getElementById('MCS Magic Style Dropdown').selectedIndex = attackStyle - 6;
                }
                //Update spells
                document.getElementById('MCS Spell Dropdown').selectedIndex = selectedSpell;
                this.simulator.selectedSpell = selectedSpell;
                this.updateSpellOptions(skillLevel[CONSTANTS.skill.Magic])
                //Update prayers
                this.simulator.activePrayers = 0;
                for (let i = 0; i < PRAYER.length; i++) {
                        let prayButton = document.getElementById(`MCS ${PRAYER[i].name} Button`);
                        if (activePrayer[i]) {
                                prayButton.className = 'mcsImageButton mcsButtonImageSelected';
                                this.simulator.prayerSelected[i] = true;
                                this.simulator.activePrayers++;
                        } else {
                                prayButton.className = 'mcsImageButton';
                                this.simulator.prayerSelected[i] = false;
                        }
                }
                this.updatePrayerOptions(skillLevel[CONSTANTS.skill.Prayer]);
                this.simulator.computeGearStats();
                this.updateEquipStats();
                this.simulator.computePrayerBonus();
                this.simulator.computeCombatStats();
                this.updateCombatStats();
        }
        //Callback Functions for the Prayer Select Card
        prayerButtonOnClick(event, prayerID) {
                let prayerChanged = false;
                if (this.simulator.prayerSelected[prayerID]) {
                        this.simulator.activePrayers--;
                        this.simulator.prayerSelected[prayerID] = false;
                        event.currentTarget.className = 'mcsImageButton';
                        prayerChanged = true;
                } else {
                        if (this.simulator.activePrayers < 2) {
                                this.simulator.activePrayers++;
                                this.simulator.prayerSelected[prayerID] = true;
                                event.currentTarget.className = 'mcsImageButton mcsButtonImageSelected';
                                prayerChanged = true;
                        } else {
                                notifyPlayer(CONSTANTS.skill.Prayer, "You can only have 2 prayers active at once.", 'danger');
                        }
                }
                if (prayerChanged) {
                        this.simulator.computePrayerBonus();
                        this.simulator.computeCombatStats();
                        this.updateCombatStats();
                }
        }
        //Callback Functions for the Sim Options Card
        maxhitsInputOnChange(event) {
                var newMaxHit = parseInt(event.currentTarget.value);
                if (newMaxHit > 0 && newMaxHit <= 10000) {
                        this.simulator.Nhitmax = newMaxHit;
                }
        }
        numtrialsInputOnChange(event) {
                var newNumTrials = parseInt(event.currentTarget.value);
                if (newNumTrials > 0 && newNumTrials <= 100000) {
                        this.simulator.Ntrials = newNumTrials;
                }
        }
        plottypeDropdownOnChange(event) {
                this.plotter.plotType = event.currentTarget.value;
                this.plotter.plotTitle.textContent = this.plotTypeDropdownOptions[event.currentTarget.selectedIndex];
                this.plotter.updateBars(this.simulator.getDataSet(event.currentTarget.value));
        }
        simulateButtonOnClick(event) {
                this.simulator.simulateCombat();
                this.plotter.updateBars(this.simulator.getDataSet(document.getElementById('MCS Plot Type Dropdown').selectedOptions[0].value));
                this.plotter.setBarColours(this.simulator.getEnterSet());
                this.updateZoneInfoCard();
        }
        sellBonesRadioOnChange(event, newState) {
                this.simulator.sellBones = newState;
                this.updatePlotForGP();
        }
        slayerTaskRadioOnChange(event, newState) {
                this.simulator.isSlayerTask = newState;
                this.updatePlotForSlayerXP();
        }
        sellLootDropdownOnChange(event) {
                this.simulator.sellLoot = event.currentTarget.value;
                if (this.simulator.sellLoot == 'Subset') {
                        document.getElementById('MCS Edit Subset Button').style.display = 'block';
                } else {
                        document.getElementById('MCS Edit Subset Button').style.display = 'none';
                }
                this.updatePlotForGP();
        }
        editSubsetButtonOnClick(event) {
                this.simulator.setLootListToSaleList();
                this.updateLootListRadios();
                this.gpOptionsCard.container.style.display = 'flex';
        }
        //Callback Functions for the GP Options Card
        setDefaultOnClick(event) {
                this.simulator.setLootListToDefault();
                this.updateLootListRadios();
        }
        setDiscoveredOnClick(event) {
                this.simulator.setLootListToDiscovered();
                this.updateLootListRadios();
        }
        cancelSubsetOnClick(event) {
                this.gpOptionsCard.container.style.display = 'none';
        }
        saveSubsetOnClick(event) {
                this.simulator.setSaleListToLootList();
                this.updatePlotForGP();
                this.gpOptionsCard.container.style.display = 'none';
        }
        searchInputOnInput(event) {
                this.updateGPSubset(event.currentTarget.value);
        }
        lootListRadioOnChange(event, llID, newState) {
                this.simulator.lootList[llID].sell = newState;
        }
        //Callback Functions for Bar inspection
        inspectMonsterOnClick(event) {
                console.log('Inpsecting Monster. Damn they\'re ugly...');
                return
        }
        barOnClick(event, barID) {
                // let barID = parseInt(event.currentTarget.getAttribute('data-barid'),10);
                if (this.barSelected) {
                        if (this.selectedBar == barID) {
                                this.barSelected = false;
                                this.removeBarhighlight(barID);
                        } else {
                                this.removeBarhighlight(this.selectedBar);
                                this.selectedBar = barID;
                                this.setBarHighlight(barID);
                        }
                } else {
                        this.barSelected = true;
                        this.selectedBar = barID;
                        this.setBarHighlight(barID);
                }
                this.updateZoneInfoCard();
        }
        setBarHighlight(barID) {
                if (this.plotter.bars[barID].className == 'mcsBar') {
                        this.plotter.bars[barID].style.border = 'thin solid red';
                } else {
                        this.plotter.bars[barID].style.border = 'thin solid blue';
                }
        }
        removeBarhighlight(barID) {
                this.plotter.bars[barID].style.border = 'none';
        }
        updateZoneInfoCard() {
                if (this.barSelected) {
                        this.zoneInfoCard.container.style.display = '';
                        if (this.barIsDungeon[this.selectedBar]) {
                                document.getElementById('MCS Zone Info Title').textContent = 'Dungeon Information';
                                document.getElementById(`MCS Zone Name Output`).textContent = DUNGEONS[this.barMonsterIDs[this.selectedBar]].name;
                                //document.getElementById('MCS Inspect Monster Button').textContent = 'Inspect Dungeon';
                                let updateInfo = this.simulator.dungeonSimData[this.barMonsterIDs[this.selectedBar]].simSuccess;
                                for (let i = 0; i < this.plotTypeDropdownValues.length; i++) {
                                        let outElem = document.getElementById(`MCS ${this.plotTypeDropdownValues[i]} Output`);
                                        outElem.textContent = ((updateInfo) ? mcsFormatNum(this.simulator.dungeonSimData[this.barMonsterIDs[this.selectedBar]][this.plotTypeDropdownValues[i]], 2) : 'N/A');
                                }
                        } else {
                                document.getElementById('MCS Zone Info Title').textContent = 'Monster Information';
                                document.getElementById(`MCS Zone Name Output`).textContent = MONSTERS[this.barMonsterIDs[this.selectedBar]].name;
                                //document.getElementById('MCS Inspect Monster Button').textContent = 'Inspect Monster';
                                let updateInfo = this.simulator.monsterSimData[this.barMonsterIDs[this.selectedBar]].simSuccess;
                                for (let i = 0; i < this.plotTypeDropdownValues.length; i++) {
                                        let outElem = document.getElementById(`MCS ${this.plotTypeDropdownValues[i]} Output`);
                                        outElem.textContent = ((updateInfo) ? mcsFormatNum(this.simulator.monsterSimData[this.barMonsterIDs[this.selectedBar]][this.plotTypeDropdownValues[i]], 2) : 'N/A');
                                }
                        }
                } else {
                        this.zoneInfoCard.container.style.display = 'none';
                }
        }
        //Functions that manipulate the UI
        disableStyleDropdown(combatType) {
                document.getElementById(`MCS ${combatType} Style Dropdown`).style.display = 'none';
                if (combatType == 'Magic') {
                        document.getElementById('MCS Spell Dropdown Container').style.display = 'none';
                }
        }
        enableStyleDropdown(combatType) {
                document.getElementById(`MCS ${combatType} Style Dropdown`).style.display = 'inline';
                if (combatType == 'Magic') {
                        document.getElementById('MCS Spell Dropdown Container').style.display = 'flex';
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
        updatePrayerOptions(prayerLevel) {
                for (let i = 0; i < PRAYER.length; i++) {
                        if (PRAYER[i].prayerLevel > prayerLevel) {
                                document.getElementById(`MCS ${PRAYER[i].name} Button`).style.display = 'none';
                        } else {
                                document.getElementById(`MCS ${PRAYER[i].name} Button`).style.display = '';
                        }
                }
        }
        updateEquipStats() {
                var newStatValue;
                for (let i = 0; i < this.equipStatKeys.length; i++) {
                        if (this.equipStatKeys[i] == 'attBon0') {
                                newStatValue = this.simulator.attBon[0];
                        } else if (this.equipStatKeys[i] == 'attBon1') {
                                newStatValue = this.simulator.attBon[1];
                        } else if (this.equipStatKeys[i] == 'attBon2') {
                                newStatValue = this.simulator.attBon[2];
                        } else {
                                newStatValue = this.simulator[this.equipStatKeys[i]];
                        }
                        document.getElementById(`MCS ${this.equipStatKeys[i]} Output`).textContent = newStatValue;
                }
        }
        updateCombatStats() {
                this.combatStatKeys.forEach(element => {
                        document.getElementById(`MCS ${element} Output`).textContent = this.simulator[element];
                })
        }
        updatePlotForGP() {
                this.simulator.updateGPData();
                if (this.plotter.plotType == 'gpPerKill') {
                        this.plotter.updateBars(this.simulator.getDataSet('gpPerKill'))
                } else if (this.plotter.plotType == 'gpPerSecond') {
                        this.plotter.updateBars(this.simulator.getDataSet('gpPerSecond'))
                }
                this.updateZoneInfoCard();
        }
        updatePlotForSlayerXP() {
                this.simulator.updateSlayerXP();
                if (this.plotter.plotType == 'slayerXpPerSecond') {
                        this.plotter.updateBars(this.simulator.getDataSet('slayerXpPerSecond'))
                }
                this.updateZoneInfoCard();
        }
        /**
         * 
         * @param {string} searchString
         */
        updateGPSubset(searchString) {
                searchString = searchString.toLowerCase();
                var lootname;
                this.simulator.lootList.forEach(loot => {
                        lootname = loot.name.toLowerCase();
                        if (lootname.includes(searchString)) {
                                document.getElementById(`MCS ${loot.name} Radio Container`).style.display = 'flex';
                        } else {
                                document.getElementById(`MCS ${loot.name} Radio Container`).style.display = 'none';
                        }
                })
        }
        updateLootListRadios() {
                this.simulator.lootList.forEach(item => {
                        if (item.sell) {
                                document.getElementById(`MCS ${item.name} Radio Yes`).checked = true;
                                document.getElementById(`MCS ${item.name} Radio No`).checked = false;
                        } else {
                                document.getElementById(`MCS ${item.name} Radio Yes`).checked = false;
                                document.getElementById(`MCS ${item.name} Radio No`).checked = true;
                        }
                })
        }
        //Callback to add to games darkmode settings
        darkModeSwitch(mode) {
                if (mode) {
                        this.content.className = 'mcsTabContent mcsDarkMode';
                        this.setDropdownOptionsColor('#2c343f');
                        this.plotter.bars.forEach(bar => { bar.style.color = 'steelblue' });
                        this.plotter.gridLine.forEach(line => { line.style.borderColor = 'lightslategray' })
                } else {
                        this.content.className = 'mcsTabContent mcsContainer';
                        this.setDropdownOptionsColor('white');
                        this.plotter.bars.forEach(bar => { bar.style.color = '#0072BD' });
                        this.plotter.gridLine.forEach(line => { line.style.borderColor = 'lightgray' })
                }
        }
        setDropdownOptionsColor(color) {
                document.getElementsByClassName('mcsOption').forEach(option => { option.style.backgroundColor = color })
        }
        //WIP Stuff for gear sets
        /**
         * @description WIP Function for gear set saving/loading. 
         * @param {string} setName 
         */
        appendGearSet(setName) {
                this.gearSets.push({
                        setName: setName,
                        setData: this.gearSelected
                })
                //Update gear set dropdown

                //Save gear sets to local storage
        }
        /**
         * @description WIP Function for removing a gear set
         * @param {number} setID 
         */
        removeGearSet(setID) {
                //Remove set from array

                //Save gear sets to local storage
        }
        setGearToSet(setID) {
                //Set Gearselected to data
                this.gearSelected = this.gearSets[setID].setData;
                //Update dropdowns to proper value
                for (let i = 0; i < this.gearSelected.length; i++) {
                        for (let j = 0; j < this.gearSubsets[i].length; j++) {
                                if (this.gearSubsets[i][j].itemID == this.gearSelected[i]) {
                                        this.gearSelecter.dropDowns[i].selectedIndex = j;
                                        break;
                                }
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
                //Update gear stats and combat stats
                this.simulator.computeGearStats();
                this.updateEquipStats();
                this.simulator.computeCombatStats();
                this.updateCombatStats();
        }
}
/**
 * @description Class for the Bar chart card
 */
class mcsPlotter {
        constructor(parent) {
                this.parent = parent;
                this.barWidth = 20;
                this.barGap = 1;
                this.plotBoxHeight = 500;
                this.yAxisWidth = 80;
                this.xAxisHeight = 80;
                this.barNames = [];
                this.barImageSrc = [];
                this.barBottomNames = [];
                this.barBottomLength = [];
                this.plotType = 'Null';
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

                this.width = this.barWidth * totBars + this.barGap * 2 + this.yAxisWidth;
                this.plotContainer = document.createElement('div');
                this.plotContainer.className = 'mcsPlotContainer';
                this.plotContainer.setAttribute('style', `width: ${this.width}px;min-width: ${this.width}px;`);
                this.plotContainer.id = 'MCS Plotter';

                this.plotTitle = document.createElement('div');
                this.plotTitle.className = 'mcsPlotTitle';
                this.plotTitle.style.width = `${this.barGap * 2 + this.barWidth * totBars}px`;
                this.plotTitle.textContent = 'XP per Second';
                this.plotContainer.appendChild(this.plotTitle);

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
                for (let i = 0; i < 20; i++) {
                        this.gridLine.push(document.createElement('div'));
                        this.gridLine[i].className = 'mcsGridline';
                        this.gridLine[i].setAttribute('style', `bottom: ${(i + 1) * 5}%;height: 5%;`);
                        this.plotBox.appendChild(this.gridLine[i]);
                }

                //Do Bars and images
                this.barStyle = `width: ${this.barWidth - this.barGap * 2}px;height: 0%;`;
                this.xAxisImages = [];
                this.xAxisImageStyle = `width: ${this.barWidth}px;height ${this.barWidth}px;`;
                this.bars = [];
                for (let i = 0; i < totBars; i++) {
                        this.bars.push(document.createElement('div'));
                        this.bars[i].className = 'mcsBar';
                        this.bars[i].setAttribute('style', this.barStyle);
                        this.bars[i].style.left = `${this.barGap + i * this.barWidth}px`;
                        this.bars[i].setAttribute('data-barid', i);
                        this.plotBox.appendChild(this.bars[i]);

                        this.xAxisImages.push(document.createElement('img'));
                        this.xAxisImages[i].className = 'mcsXAxisImage';
                        this.xAxisImages[i].setAttribute('src', this.barImageSrc[i]);
                        this.xAxisImages[i].setAttribute('style', this.xAxisImageStyle);
                        this.xAxisImages[i].style.left = `${i * this.barWidth}px`;
                        this.xAxis.appendChild(this.xAxisImages[i]);
                }
                //Do Second descriptions
                var botLength = 0;
                this.barBottomDivs = [];
                var divi = 0;
                for (let i = this.barBottomNames.length - 1; i > -1; i--) {
                        this.barBottomDivs.push(document.createElement('div'));
                        this.barBottomDivs[divi].appendChild(document.createTextNode(this.barBottomNames[i]));
                        this.barBottomDivs[divi].className = 'mcsPlotLabel';
                        this.barBottomDivs[divi].style.right = `${100 * botLength / totBars + 50 * this.barBottomLength[i] / totBars}%`;
                        this.xAxis.appendChild(this.barBottomDivs[divi]);
                        var newSect = document.createElement('div');
                        newSect.className = 'mcsXAxisSection';
                        newSect.style.width = `${100 * this.barBottomLength[i] / totBars}%`;
                        newSect.style.right = `${100 * botLength / totBars}%`;
                        if (i == 0) {
                                newSect.style.borderLeftStyle = 'solid';
                        }
                        this.xAxis.appendChild(newSect);

                        botLength += this.barBottomLength[i];
                        divi++;
                }
                //Do tickmarks
                this.tickMarks = [];
                for (let i = 0; i < 20; i++) {
                        this.tickMarks.push(document.createElement('div'));
                        this.tickMarks[i].className = 'mcsTickmark';
                        this.tickMarks[i].style.height = '5%';
                        this.tickMarks[i].style.bottom = `${(i + 1) * 5}%`;
                        this.plotBox.appendChild(this.tickMarks[i]);

                }
                //Do ticktext
                this.tickText = [];
                for (let i = 0; i < 21; i++) {
                        this.tickText.push(document.createElement('div'));
                        this.tickText[i].className = 'mcsTicktext';
                        this.tickText[i].setAttribute('style', `height: 5%; bottom: ${i * 5 - 2.5}%;`);
                        this.tickText[i].appendChild(document.createTextNode(mcsFormatNum(i * 0.05, 2)));
                        this.yAxis.appendChild(this.tickText[i]);
                }
                //Do Tooltips
                this.barTooltips = [];
                for (let i = 0; i < this.bars.length; i++) {
                        this.barTooltips.push(document.createElement('div'));
                        this.barTooltips[i].className = 'mcsBarTooltip';
                        this.barTooltips[i].setAttribute('style', 'top: 0%;display: none;')
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
                if (barMax != 0) {
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
                } else {
                        var divMax = 1;
                        var Ndivs = 10;
                        var division = 0.1;
                }

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

        setBarColours(enterSet) {
                for (let i = 0; i < enterSet.length; i++) {
                        if (enterSet[i]) {
                                this.bars[i].className = 'mcsBar';
                        } else {
                                this.bars[i].className = 'mcsBar mcsBarCantEnter';
                        }
                        if (this.parent.barSelected && this.parent.selectedBar == i) {
                                this.parent.setBarHighlight(i);
                        }
                }
        }
}

/**
 * @description Simulator, Pure number crunching
 */
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
                        Magic: 0,
                        Prayer: 0,
                        Slayer: 0
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
                this.eqpDmgRed = 0;
                this.rngDefBon = 0;
                this.magDefBon = 0;
                this.attReq = 1;
                this.rngReq = 1;
                this.magReq = 1;
                this.defReq = 1;
                this.slayerXPBonus = 0;
                //Combat Stats
                this.selectedSpell = 0;
                this.styles = {
                        Melee: 0,
                        Ranged: 0,
                        Magic: 0
                };
                this.dmgRed = 0;
                this.attackSpeed = 4000;
                this.attackType = 0;
                this.maxAttackRoll = 0;
                this.maxHit = 0;
                this.maxMagDefRoll = 0;
                this.maxDefRoll = 0;
                this.maxRngDefRoll = 0;
                //Prayer Stats
                this.prayerSelected = [];
                for (let i = 0; i < PRAYER.length; i++) {
                        this.prayerSelected.push(false);
                }
                this.activePrayers = 0;
                this.prayerBonusAttack = 1;
                this.prayerBonusStrength = 1;
                this.prayerBonusDefence = 1;
                this.prayerBonusAttackRanged = 1;
                this.prayerBonusStrengthRanged = 1;
                this.prayerBonusDefenceRanged = 1;
                this.prayerBonusAttackMagic = 1;
                this.prayerBonusDamageMagic = 1;
                this.prayerBonusDefenceMagic = 1;
                this.prayerBonusProtectItem = 0;
                this.prayerBonusHitpoints = 1;
                this.prayerBonusProtectFromMelee = 0;
                this.prayerBonusProtectFromRanged = 0;
                this.prayerBonusProtectFromMagic = 0;
                this.prayerBonusHitpointHeal = 0;

                this.prayerPointsPerAttack = 0;
                this.prayerPointsPerEnemy = 0;
                this.prayerPointsPerHeal = 0;
                //Slayer Variables
                this.isSlayerTask = false;

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
                                xpPerHit: 0,
                                hpxpPerEnemy: 0,
                                hpxpPerSecond: 0,
                                hpPerEnemy: 0,
                                hpPerSecond: 0,
                                dmgPerSecond: 0,
                                avgKillTime: 0,
                                avgNumHits: 0,
                                avgHitDmg: 0,
                                killTimeS: 0,
                                gpPerKill: 0,
                                gpPerSecond: 0,
                                prayerXpPerEnemy: 0,
                                prayerXpPerSecond: 0,
                                slayerXpPerSecond: 0,
                                ppConsumedPerSecond: 0
                        })
                }
                this.dungeonSimData = [];
                for (let i = 0; i < DUNGEONS.length; i++) {
                        this.dungeonSimData.push({
                                simSuccess: false,
                                xpPerSecond: 0,
                                xpPerHit: 0,
                                hpxpPerSecond: 0,
                                hpPerEnemy: 0,
                                hpPerSecond: 0,
                                dmgPerSecond: 0,
                                avgKillTime: 0,
                                avgNumHits: 0,
                                avgHitDmg: 0,
                                killTimeS: 0,
                                gpPerKill: 0,
                                gpPerSecond: 0,
                                prayerXpPerSecond: 0,
                                slayerXpPerSecond: 0,
                                ppConsumedPerSecond: 0
                        })
                }
                this.simGpBonus = 1;
                this.simSlayerXPBonus = 0;
                //Options for GP/s calculations
                this.sellBones = false; //True or false
                this.sellLoot = 'All'; //Options 'All','Subset','None'
                this.saleList = this.getSaleList();
                this.lootList = this.getLootList(); //List of items with id: X and sell: true/false
                this.defaultSaleKeep = [403, 247, 248, 366, 249, 383, 368, 246, 367, 348, 443, 350, 349, 351, 347, 430, 429, 427, 428, 137, 136, 139, 314, 313, 312, 134, 296, 138, 141, 140, 434, 142, 135, 426, 425, 423, 424, 418, 417, 415, 416, 340, 405, 344, 406, 361, 414, 413, 411, 412, 372, 378, 371, 374, 369, 373, 380, 376, 375, 377, 379, 370, 407, 341, 365, 364, 422, 421, 419, 420, 120, 404];
                this.setSaleListToDefault();
        }
        /**
         * @description Computes the stats of the players equipped items and stores them on this properties
         */
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
                        this.eqpDmgRed += (curItem.damageReduction) ? curItem.damageReduction : 0;
                        this.rngDefBon += (curItem.rangedDefenceBonus) ? curItem.rangedDefenceBonus : 0;
                        this.magDefBon += (curItem.magicDefenceBonus) ? curItem.magicDefenceBonus : 0;
                        this.slayerXPBonus += (curItem.slayerBonusXP) ? curItem.slayerBonusXP : 0;

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
        /**
         * @description Computes the combat stats from Equipment stats, combat style, spell selection and player levels and stores them on this properties
         */
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
                        this.maxAttackRoll = Math.floor(effectiveAttackLevel * (this.rngAttBon + 64) * (1 + (this.prayerBonusAttackRanged / 100)));

                        var effectiveStrengthLevel = Math.floor(this.playerLevels.Ranged + attackStyleBonus);
                        this.maxHit = Math.floor(numberMultiplier * ((1.3 + effectiveStrengthLevel / 10 + this.rngStrBon / 80 + effectiveStrengthLevel * this.rngStrBon / 640) * (1 + (this.prayerBonusStrengthRanged / 100))));
                        //Magic
                } else if (items[weaponID].isMagic) {
                        this.attackType = 2;
                        effectiveAttackLevel = Math.floor(this.playerLevels.Magic + 8 + attackStyleBonus);
                        this.maxAttackRoll = Math.floor(effectiveAttackLevel * (this.magAttBon + 64) * (1 + (this.prayerBonusAttackMagic / 100)));
                        this.maxHit = Math.floor(numberMultiplier * (SPELLS[this.selectedSpell].maxHit + (SPELLS[this.selectedSpell].maxHit * (this.magDmgBon / 100))));
                        this.attackSpeed = this.eqpAttSpd;
                        //Melee
                } else {
                        this.attackType = 0;
                        effectiveAttackLevel = Math.floor(this.playerLevels.Attack + 8 + attackStyleBonus);
                        this.maxAttackRoll = Math.floor(effectiveAttackLevel * (this.attBon[this.styles.Melee] + 64) * (1 + (this.prayerBonusAttack / 100)));

                        effectiveStrengthLevel = Math.floor(this.playerLevels.Strength + 8 + 1);
                        this.maxHit = Math.floor(numberMultiplier * ((1.3 + effectiveStrengthLevel / 10 + this.strBon / 80 + effectiveStrengthLevel * this.strBon / 640) * (1 + (this.prayerBonusStrength / 100))));
                        this.attackSpeed = this.eqpAttSpd;
                }
                var effectiveDefenceLevel = Math.floor(this.playerLevels.Defence + 8 + meleeDefenceBonus);
                this.maxDefRoll = Math.floor(effectiveDefenceLevel * (this.defBon + 64) * (1 + (this.prayerBonusDefence) / 100));
                var effectiveRngDefenceLevel = Math.floor(this.playerLevels.Defence + 8 + 1);
                this.maxRngDefRoll = Math.floor(effectiveRngDefenceLevel * (this.rngDefBon + 64) * (1 + (this.prayerBonusDefenceRanged) / 100));
                //This might be changed because it is currently a bug
                var effectiveMagicDefenceLevel = Math.floor(this.playerLevels.Magic * 0.7 + this.playerLevels.Defence * 0.3);
                this.maxMagDefRoll = Math.floor(effectiveMagicDefenceLevel * (this.magDefBon + 64) * (1 + (this.prayerBonusDefenceMagic / 100)) + 8 + 1);
                this.dmgRed = this.eqpDmgRed;
        }
        /**
         * @description Computes the prayer bonuses for the selected prayers
         */
        computePrayerBonus() {
                this.resetPrayerBonus();
                for (let i = 0; i < this.prayerSelected.length; i++) {
                        if (this.prayerSelected[i]) {
                                for (let j = 0; j < PRAYER[i].vars.length; j++) {
                                        this[PRAYER[i].vars[j]] += PRAYER[i].values[j];
                                }
                        }
                }
        }
        resetPrayerBonus() {
                this.prayerBonusAttack = 1;
                this.prayerBonusStrength = 1;
                this.prayerBonusDefence = 1;
                this.prayerBonusAttackRanged = 1;
                this.prayerBonusStrengthRanged = 1;
                this.prayerBonusDefenceRanged = 1;
                this.prayerBonusAttackMagic = 1;
                this.prayerBonusDamageMagic = 1;
                this.prayerBonusDefenceMagic = 1;
                this.prayerBonusProtectItem = 0;
                this.prayerBonusHitpoints = 1;
                this.prayerBonusProtectFromMelee = 0;
                this.prayerBonusProtectFromRanged = 0;
                this.prayerBonusProtectFromMagic = 0;
                this.prayerBonusHitpointHeal = 0;
        }
        /**
         * @description Resets the properties of this that refer to equipment stats to their default values
         */
        resetGearStats() {
                this.eqpAttSpd = 4000;
                this.strBon = 0;
                this.attBon = [0, 0, 0];
                this.rngAttBon = 0;
                this.rngStrBon = 0;
                this.magAttBon = 0;
                this.magDmgBon = 0;
                this.defBon = 0;
                this.eqpDmgRed = 0;
                this.rngDefBon = 0;
                this.magDefBon = 0;
                this.attReq = 1;
                this.rngReq = 1;
                this.magReq = 1;
                this.defReq = 1;
                this.slayerXPBonus = 0;
        }
        /**
         * @description Iterate through all the combatAreas and DUNGEONS to create a set of monsterSimData and dungeonSimData
         */
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
                        xpBonus: 0,
                        avgHPRegen: 1,
                        damageReduction: this.dmgRed,
                        reflect: false
                }
                console.log(playerStats);
                if (this.parent.gearSelected[CONSTANTS.equipmentSlot.Ring] == CONSTANTS.item.Gold_Emerald_Ring) {
                        playerStats.xpBonus = 0.1;
                }
                if (this.parent.gearSelected[CONSTANTS.equipmentSlot.Ring] == CONSTANTS.item.Gold_Sapphire_Ring) {
                        playerStats.reflect = true;
                }
                if (this.parent.gearSelected[CONSTANTS.equipmentSlot.Ring] == CONSTANTS.item.Gold_Topaz_Ring) {
                        this.simGpBonus = 1.15;
                } else {
                        this.simGpBonus = 1;
                }
                this.simSlayerXPBonus = this.slayerXPBonus;
                if (this.parent.gearSelected[CONSTANTS.equipmentSlot.Ring] == CONSTANTS.item.Gold_Ruby_Ring) {
                        playerStats.avgHPRegen = 2;
                }
                if (this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Hitpoints_Skillcape) {
                        playerStats.avgHPRegen += 5;
                }

                playerStats.avgHPRegen *= numberMultiplier;
                if (this.prayerSelected[CONSTANTS.prayer.Rapid_Heal]) playerStats.avgHPRegen *= 2;

                //Compute prayer point usage
                let hasPrayerCape = (this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Prayer_Skillcape);
                this.prayerPointsPerAttack = 0;
                this.prayerPointsPerEnemy = 0;
                this.prayerPointsPerHeal = 0;
                for (let i = 0; i < PRAYER.length; i++) {
                        if (this.prayerSelected[i]) {
                                if (hasPrayerCape) {
                                        let attQty = Math.floor(PRAYER[i].pointsPerPlayer / 2);
                                        if (attQty == 0) {
                                                attQty = 1;
                                        }
                                        let enemyQty = Math.floor(PRAYER[i].pointsPerEnemy / 2);
                                        if (enemyQty == 0) {
                                                enemyQty = 1;
                                        }
                                        let healQty = Math.floor(PRAYER[i].pointsPerRegen / 2);
                                        if (healQty == 0) {
                                                healQty = 1;
                                        }
                                        this.prayerPointsPerAttack += attQty;
                                        this.prayerPointsPerEnemy += enemyQty;
                                        this.prayerPointsPerHeal += healQty;
                                } else {
                                        this.prayerPointsPerAttack += PRAYER[i].pointsPerPlayer;
                                        this.prayerPointsPerEnemy += PRAYER[i].pointsPerEnemy;
                                        this.prayerPointsPerHeal += PRAYER[i].pointsPerRegen;
                                }
                        }
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
                var totPrayXP = 0;
                var totHits = 0;
                var totHP = 0;
                var totEnemyHP = 0;
                var totTime = 0;
                var totPrayerPoints = 0;

                for (let i = 0; i < DUNGEONS.length; i++) {
                        this.dungeonSimData[i].simSuccess = true;
                        totXp = 0;
                        totHpXp = 0;
                        totPrayXP = 0;
                        totHits = 0;
                        totHP = 0;
                        totEnemyHP = 0;
                        totPrayerPoints = 0;
                        totTime = 0;
                        for (let j = 0; j < DUNGEONS[i].monsters.length; j++) {
                                let mInd = DUNGEONS[i].monsters[j];
                                totXp += this.monsterSimData[mInd].xpPerEnemy;
                                totHpXp += this.monsterSimData[mInd].hpxpPerEnemy;
                                totPrayXP += this.monsterSimData[mInd].prayerXpPerEnemy;
                                totHits += this.monsterSimData[mInd].avgNumHits;
                                totHP += this.monsterSimData[mInd].hpPerEnemy;
                                totEnemyHP += MONSTERS[mInd].hitpoints;
                                totTime += this.monsterSimData[mInd].avgKillTime;
                                totPrayerPoints += this.monsterSimData[mInd].ppConsumedPerSecond * this.monsterSimData[mInd].killTimeS;
                                if (!this.monsterSimData[mInd].simSuccess) {
                                        this.dungeonSimData[i].simSuccess = false;
                                        break;
                                }
                        }
                        if (this.dungeonSimData[i].simSuccess) {
                                this.dungeonSimData[i].xpPerSecond = totXp / totTime * 1000;
                                this.dungeonSimData[i].xpPerHit = totXp / totHits;
                                this.dungeonSimData[i].hpxpPerSecond = totHpXp / totTime * 1000;
                                this.dungeonSimData[i].prayerXpPerSecond = totPrayXP / totTime * 1000;
                                this.dungeonSimData[i].hpPerSecond = totHP / totTime * 1000;
                                this.dungeonSimData[i].dmgPerSecond = totEnemyHP / totTime * 1000;
                                this.dungeonSimData[i].avgKillTime = totTime;
                                this.dungeonSimData[i].avgNumHits = totHits;
                                this.dungeonSimData[i].avgHitDmg = totEnemyHP / totHits;
                                this.dungeonSimData[i].killTimeS = totTime / 1000;
                                this.dungeonSimData[i].ppConsumedPerSecond = totPrayerPoints / this.dungeonSimData[i].killTimeS;
                        }
                }
                this.updateGPData();
                this.updateSlayerXP();
        }
        /**
         * @description Simulates combat against monsterID, Ntrials times using playerStats. The simulation fails if the number of player hit attempts exceeds Nhitmax.
         * @param {number} monsterID The index of the monster in MONSTERS
         * @param {object} playerStats The stats of the player
         * @param {number} Ntrials The number of times to simulate combat
         * @param {number} Nhitmax The maximum number of player hits before timeout
         */
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
                enemyStats.hitpoints = MONSTERS[monsterID].hitpoints * numberMultiplier;
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
                        enemyStats.maxHit = Math.floor(numberMultiplier * (1.3 + (effectiveStrengthLevel / 10) + (MONSTERS[monsterID].strengthBonus / 80) + (effectiveStrengthLevel * MONSTERS[monsterID].strengthBonus / 640)));
                }
                else if (MONSTERS[monsterID].attackType === CONSTANTS.attackType.Ranged) {
                        var effectiveAttackLevel = Math.floor(MONSTERS[monsterID].rangedLevel + 8 + 1);
                        enemyStats.maxAttackRoll = effectiveAttackLevel * (MONSTERS[monsterID].attackBonusRanged + 64);
                        var effectiveStrengthLevel = Math.floor(MONSTERS[monsterID].rangedLevel + 8 + 1);
                        enemyStats.maxHit = Math.floor(numberMultiplier * (1.3 + (effectiveStrengthLevel / 10) + (MONSTERS[monsterID].strengthBonusRanged / 80) + (effectiveStrengthLevel * MONSTERS[monsterID].strengthBonusRanged / 640)));
                }
                else if (MONSTERS[monsterID].attackType === CONSTANTS.attackType.Magic) {
                        var effectiveAttackLevel = Math.floor(MONSTERS[monsterID].magicLevel + 8 + 1);
                        enemyStats.maxAttackRoll = effectiveAttackLevel * (MONSTERS[monsterID].attackBonusMagic + 64);
                        enemyStats.maxHit = Math.floor(numberMultiplier * (SPELLS[MONSTERS[monsterID].selectedSpell].maxHit + (SPELLS[MONSTERS[monsterID].selectedSpell].maxHit * (MONSTERS[monsterID].damageBonusMagic / 100))));
                }
                //Calculate Accuracy
                var playerAccuracy = this.calculateAccuracy(playerStats, enemyStats);

                if ((MONSTERS[monsterID].attackType === CONSTANTS.attackType.Melee && this.prayerBonusProtectFromMelee > 0) || (MONSTERS[monsterID].attackType === CONSTANTS.attackType.Ranged && this.prayerBonusProtectFromRanged > 0) || (MONSTERS[monsterID].attackType === CONSTANTS.attackType.Magic && this.prayerBonusProtectFromMagic > 0)) {
                        var enemyAccuracy = 5;
                } else {
                        var enemyAccuracy = this.calculateAccuracy(enemyStats, playerStats);
                }
                //Start Monte Carlo simulation
                var enemyKills = 0;
                var currentHP = 0;
                var totalHits = 0;
                var totalEnemyHits = 0;
                var totalXP = 0;
                var totalHpXp = 0;
                var totalPrayerXP = 0;
                var currentHits = 0;
                var xpToAdd = 0;
                var hpXpToAdd = 0;
                var prayerXpToAdd = 0;
                var damageToPlayer = 0;
                var simSuccess = true;
                var damageToEnemy = 0;
                var enemyAttackTimer = 0; //Time tracking for enemy Attacks
                //var enemyReflectDamage = 0; //Damage caused by reflect

                //Start simulation for each trial
                while (enemyKills < Ntrials && simSuccess) {
                        //Reset stats for trial
                        currentHP = enemyStats.hitpoints;
                        currentHits = 0;
                        enemyAttackTimer = 0;

                        //Simulate combat until enemy is dead or max hits has been reached
                        while (currentHP > 0) {
                                currentHits++;
                                totalHits++;
                                if (currentHits > Nhitmax) {
                                        simSuccess = false;
                                        break;
                                }
                                //Process Enemy Hits
                                enemyAttackTimer += playerStats.attackSpeed;
                                while (enemyAttackTimer >= enemyStats.attackSpeed) {
                                        totalEnemyHits++;
                                        if (enemyAccuracy > Math.floor(Math.random() * 100)) {
                                                let enemyDamage = Math.floor(Math.random() * enemyStats.maxHit) + 1;
                                                enemyDamage -= Math.floor(((playerStats.damageReduction / 100) * enemyDamage));
                                                damageToPlayer += enemyDamage;
                                        }
                                        if (playerStats.reflect) {
                                                let reflectDamage = Math.floor((Math.random() * 3) * numberMultiplier);
                                                if (currentHP > reflectDamage) {
                                                        currentHP -= reflectDamage;
                                                        //enemyReflectDamage += reflectDamage;
                                                }
                                        }
                                        enemyAttackTimer -= enemyStats.attackSpeed;
                                }
                                //Process Player Hit
                                if (playerAccuracy > Math.floor(Math.random() * 100)) {
                                        damageToEnemy = Math.floor(Math.random() * playerStats.maxHit) + 1;
                                        if (damageToEnemy > currentHP) {
                                                damageToEnemy = currentHP;
                                        }
                                        currentHP -= damageToEnemy;
                                        //XP calculation
                                        xpToAdd = Math.floor(damageToEnemy / numberMultiplier * 4);
                                        if (xpToAdd < 4) xpToAdd = 4;
                                        hpXpToAdd = Math.round((damageToEnemy / numberMultiplier * 1.33) * 100) / 100;
                                        prayerXpToAdd = Math.round((damageToEnemy / numberMultiplier) * 100) / 100;
                                        //Active Prayer Bonus
                                        for (let i = 0; i < this.prayerSelected.length; i++) {
                                                if (this.prayerSelected[i]) {
                                                        prayerXpToAdd += Math.floor(damageToEnemy / numberMultiplier * 2) * PRAYER[i].pointsPerPlayer;
                                                }
                                        }
                                        //Ring bonus
                                        xpToAdd += Math.floor(xpToAdd * playerStats.xpBonus);
                                        hpXpToAdd += Math.floor(hpXpToAdd * playerStats.xpBonus);
                                        prayerXpToAdd += Math.floor(prayerXpToAdd * playerStats.xpBonus);

                                        totalHpXp += hpXpToAdd;
                                        totalPrayerXP += prayerXpToAdd;
                                        if (playerStats.halfXP) {
                                                totalXP += Math.floor(xpToAdd / 2);
                                        } else {
                                                totalXP += xpToAdd;
                                        }
                                }
                        }
                        enemyKills++;
                }
                //Compute stats from simulation
                this.monsterSimData[monsterID].simSuccess = simSuccess;
                if (simSuccess) {
                        this.monsterSimData[monsterID].avgNumHits = totalHits / Ntrials;
                        this.monsterSimData[monsterID].avgHitDmg = enemyStats.hitpoints * Ntrials / totalHits;
                        this.monsterSimData[monsterID].avgKillTime = enemySpawnTimer + playerStats.attackSpeed * this.monsterSimData[monsterID].avgNumHits;

                        this.monsterSimData[monsterID].hpPerEnemy = damageToPlayer / Ntrials;
                        this.monsterSimData[monsterID].hpPerSecond = this.monsterSimData[monsterID].hpPerEnemy / this.monsterSimData[monsterID].avgKillTime * 1000 - playerStats.avgHPRegen / 60;
                        if (this.monsterSimData[monsterID].hpPerSecond < 0) {
                                this.monsterSimData[monsterID].hpPerSecond = 0;
                        }
                        this.monsterSimData[monsterID].dmgPerSecond = enemyStats.hitpoints / this.monsterSimData[monsterID].avgKillTime * 1000;
                        this.monsterSimData[monsterID].xpPerEnemy = totalXP / Ntrials;
                        this.monsterSimData[monsterID].xpPerHit = totalXP / totalHits;
                        this.monsterSimData[monsterID].xpPerSecond = totalXP / Ntrials / this.monsterSimData[monsterID].avgKillTime * 1000;
                        this.monsterSimData[monsterID].hpxpPerEnemy = totalHpXp / Ntrials;
                        this.monsterSimData[monsterID].hpxpPerSecond = totalHpXp / Ntrials / this.monsterSimData[monsterID].avgKillTime * 1000;
                        this.monsterSimData[monsterID].killTimeS = this.monsterSimData[monsterID].avgKillTime / 1000;
                        this.monsterSimData[monsterID].prayerXpPerEnemy = totalPrayerXP / Ntrials;
                        this.monsterSimData[monsterID].prayerXpPerSecond = totalPrayerXP / Ntrials / this.monsterSimData[monsterID].avgKillTime * 1000;

                        this.monsterSimData[monsterID].ppConsumedPerSecond = (totalHits * this.prayerPointsPerAttack + totalEnemyHits * this.prayerPointsPerEnemy) / Ntrials / this.monsterSimData[monsterID].killTimeS + this.prayerPointsPerHeal / 60;
                }
                this.monsterSimData[monsterID].simDone = true;
        }
        /**
         * @description Resets the simulation status for each monster
         */
        resetSimDone() {
                for (let i = 0; i < MONSTERS.length; i++) {
                        this.monsterSimData[i].simDone = false;
                }
        }
        /**
         * @description Computes the accuracy of attacker vs target
         * @param {object} attacker 
         * @param {object} target 
         */
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
        /**
         * @description Extracts a set of data for plotting that matches the keyValue in monsterSimData and dungeonSimData
         * @param {string} keyValue 
         */
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
        getEnterSet() {
                var enterSet = [];
                //Compile data from monsters in combat zones
                for (let i = 0; i < combatAreas.length; i++) {
                        let canEnter = true;
                        if (combatAreas[i].slayerLevel != undefined && this.playerLevels.Slayer < combatAreas[i].slayerLevel) {
                                canEnter = false;
                        }
                        if (combatAreas[i].slayerItem != 0) {
                                let gearFound = false;
                                for (let j = 0; j < this.parent.gearSelected.length; j++) {
                                        if (this.parent.gearSelected[j] == combatAreas[i].slayerItem) {
                                                gearFound = true;
                                        }
                                }
                                if (!gearFound) {
                                        canEnter = false;
                                }
                                if (this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Slayer_Skillcape) {
                                        canEnter = true;
                                }
                        }
                        for (let j = 0; j < combatAreas[i].monsters.length; j++) {
                                enterSet.push(canEnter);
                        }
                }
                //Perform simulation of monsters in dungeons
                for (let i = 0; i < DUNGEONS.length; i++) {
                        enterSet.push(true);
                }
                return enterSet;
        }
        /**
         * @description Computes the average number of coins that a monster drops
         * @param {number} monsterID 
         */
        computeAverageCoins(monsterID) {
                return (MONSTERS[monsterID].dropCoins[1] + MONSTERS[monsterID].dropCoins[0] - 1) * this.simGpBonus / 2;
        }
        /**
         * @description Computes the chance that a monster will drop loot when it dies
         * @param {number} monsterID 
         */
        computeLootChance(monsterID) {
                return ((MONSTERS[monsterID].lootChance != undefined) ? MONSTERS[monsterID].lootChance / 100 : 1);
        }
        /**
         * @description Computes the value of a monsters drop table respecting the loot sell settings
         * @param {number} monsterID 
         */
        //lootTable[x][0]: Item ID, [x][1]: Weight [x][2]: Max Qty
        computeDropTableValue(monsterID) {
                if (MONSTERS[monsterID].lootTable && this.sellLoot != 'None') {
                        var gpWeight = 0;
                        var totWeight = 0;
                        if (this.sellLoot == 'All') {
                                MONSTERS[monsterID].lootTable.forEach(x => {
                                        let avgQty = (x[2] + 1) / 2;
                                        if (items[x[0]].canOpen) {
                                                gpWeight += this.computeChestOpenValue(x[0]) * avgQty;
                                        } else {
                                                gpWeight += items[x[0]].sellsFor * x[1] * avgQty;

                                        }
                                        totWeight += x[1];
                                })
                        } else {
                                MONSTERS[monsterID].lootTable.forEach(x => {
                                        let avgQty = (x[2] + 1) / 2;
                                        if (items[x[0]].canOpen) {
                                                gpWeight += this.computeChestOpenValue(x[0]) * avgQty;
                                        } else {
                                                gpWeight += ((this.shouldSell(x[0])) ? items[x[0]].sellsFor : 0) * x[1] * avgQty;
                                        }
                                        totWeight += x[1];
                                })
                        }
                        return gpWeight / totWeight;
                } else {
                        return 0;
                }
        }
        /**
         * @description determines if an itemID should be sold and turns true/false
         * @param {number} itemID 
         */
        shouldSell(itemID) {
                return this.saleList[itemID].sell;
        }
        /**
         * @description Gets an object array equal in length to the items array that determines if a particular item should be sold or kept
         */
        getSaleList() {
                var saleList = [];
                for (let i = 0; i < items.length; i++) {
                        saleList.push({
                                id: i,
                                name: items[i].name,
                                sell: true,
                                onLootList: false,
                                lootlistID: -1
                        });
                }
                return saleList;
        }
        /**
         * @description Gets an object array containing only items that are obtainable from combatAreas/Dungeons
         */
        getLootList() {
                var lootList = [];
                combatAreas.forEach(area => {
                        area.monsters.forEach(mID => {
                                MONSTERS[mID].lootTable.forEach(loot => {
                                        if (items[loot[0]].canOpen) {
                                                items[loot[0]].dropTable.forEach(loot2 => {
                                                        if (!this.saleList[loot2[0]].onLootList) {
                                                                lootList.push({
                                                                        id: loot2[0],
                                                                        name: items[loot2[0]].name,
                                                                        sell: false
                                                                })
                                                                this.saleList[loot2[0]].onLootList = true;
                                                        }
                                                })
                                        } else {
                                                if (!this.saleList[loot[0]].onLootList) {
                                                        lootList.push({
                                                                id: loot[0],
                                                                name: items[loot[0]].name,
                                                                sell: false
                                                        })
                                                        this.saleList[loot[0]].onLootList = true;
                                                }
                                        }
                                })
                        })
                })
                DUNGEONS.forEach(dungeon => {
                        dungeon.rewards.forEach(item => {
                                if (items[item].canOpen) {
                                        items[item].dropTable.forEach(loot => {
                                                if (!this.saleList[loot[0]].onLootList) {
                                                        lootList.push({
                                                                id: loot[0],
                                                                name: items[loot[0]].name,
                                                                sell: false
                                                        })
                                                        this.saleList[loot[0]].onLootList = true;
                                                }
                                        })
                                } else {
                                        if (!this.saleList[item].onLootList) {
                                                lootList.push({
                                                        id: item,
                                                        name: items[item].name,
                                                        sell: false
                                                })
                                                this.saleList[item].onLootList = true;
                                        }
                                }
                        })
                })
                //Alphabetize loot list
                lootList.sort((a, b) => {
                        var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                        var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                        if (nameA < nameB) {
                                return -1;
                        }
                        if (nameA > nameB) {
                                return 1;
                        }
                        // names must be equal
                        return 0;
                })
                //Set Salelist IDs
                for (let i = 0; i < lootList.length; i++) {
                        this.saleList[lootList[i].id].lootlistID = i;
                }
                return lootList;
        }
        /**
         * @description Sets the lootlist to the current sale list
         */
        setLootListToSaleList() {
                this.saleList.forEach(item => {
                        if (item.lootlistID != -1) {
                                this.lootList[item.lootlistID].sell = item.sell;
                        }
                })
        }
        /**
         * @description Sets the salelist to the loot list
         */
        setSaleListToLootList() {
                this.lootList.forEach(item => {
                        this.saleList[item.id].sell = item.sell;
                })
        }
        /**
         * @description Prints out the current loot list to the console
         */
        printLootList() {
                var outStr = 'ID\tName\tSell\n';
                this.lootList.forEach(item => {
                        outStr += `${item.id}\t${item.name}\t${item.sell}\n`;
                })
                console.log(outStr);
        }
        /**
         * @description Sets the sale list to the default setting of combat uniques
         */
        setSaleListToDefault() {
                for (let i = 0; i < this.saleList.length; i++) {
                        this.saleList[i].sell = true;
                }
                this.defaultSaleKeep.forEach(itemID => {
                        this.saleList[itemID].sell = false;
                })
        }
        /**
         * @description sets the loot list to sell only items that have been discovered by the player
         */
        setLootListToDiscovered() {
                for (let i = 0; i < itemStats.length; i++) {
                        if (this.saleList[i].onLootList) {
                                this.lootList[this.saleList[i].lootlistID].sell = (itemStats[i].timesFound > 0);
                        }
                }
        }
        /**
         * @description Sets the loot list to default settings
         */
        setLootListToDefault() {
                for (let i = 0; i < this.lootList.length; i++) {
                        this.lootList[i].sell = true;
                }
                this.defaultSaleKeep.forEach(itemID => {
                        if (this.saleList[itemID].onLootList) {
                                this.lootList[this.saleList[itemID].lootlistID].sell = false;
                        }
                })
        }
        /**
         * @description Computes the value of the contents of a chest respecting the loot sell settings
         * @param {number} chestID 
         */
        computeChestOpenValue(chestID) {
                if (this.sellLoot != 'None') {
                        var gpWeight = 0;
                        var totWeight = 0;
                        var avgQty;
                        if (this.sellLoot == 'All') {
                                for (let i = 0; i < items[chestID].dropTable.length; i++) {
                                        if ((items[chestID].dropQty != undefined) && (items[chestID].dropQty[i] != undefined)) {
                                                avgQty = (items[chestID].dropQty[i] + 1) / 2;
                                        } else {
                                                avgQty = 1;
                                        }
                                        gpWeight += avgQty * items[items[chestID].dropTable[i][0]].sellsFor * items[chestID].dropTable[i][1];
                                        totWeight += items[chestID].dropTable[i][1];
                                }
                        } else {
                                for (let i = 0; i < items[chestID].dropTable.length; i++) {
                                        if (items[chestID].dropQty) {
                                                avgQty = (items[chestID].dropQty[i] + 1) / 2;
                                        } else {
                                                avgQty = 1;
                                        }
                                        gpWeight += ((this.shouldSell(items[chestID].dropTable[i][0])) ? items[items[chestID].dropTable[i][0]].sellsFor : 0) * avgQty * items[chestID].dropTable[i][1];
                                        totWeight += items[chestID].dropTable[i][1];
                                }
                        }
                        return gpWeight / totWeight;
                } else {
                        return 0;
                }
        }
        /**
         * @description Computes the average amount of GP earned when killing a monster, respecting the loot sell settings
         * @param {number} monsterID 
         */
        computeMonsterValue(monsterID) {
                var monsterValue = 0;
                monsterValue += this.computeAverageCoins(monsterID);
                monsterValue += this.computeDropTableValue(monsterID);
                monsterValue *= this.computeLootChance(monsterID);
                if (this.sellBones) {
                        monsterValue += items[MONSTERS[monsterID].bones].sellsFor;
                }
                return monsterValue;
        }
        /**
         * @description Computes the average amount of GP earned when completing a dungeon, respecting the loot sell settings
         * @param {number} dungeonID 
         */
        computeDungeonValue(dungeonID) {
                var dungeonValue = 0;
                if (this.sellLoot != 'None') {
                        DUNGEONS[dungeonID].rewards.forEach(reward => {
                                if (items[reward].canOpen) {
                                        dungeonValue += this.computeChestOpenValue(reward);
                                } else {
                                        if (this.sellLoot == 'All') {
                                                dungeonValue += items[reward].sellsFor;
                                        } else {
                                                dungeonValue += ((this.shouldSell(reward)) ? items[reward].sellsFor : 0);
                                        }
                                }
                        })
                }
                dungeonValue += this.computeAverageCoins(DUNGEONS[dungeonID].monsters[DUNGEONS[dungeonID].monsters.length - 1]);
                return dungeonValue;
        }
        /**
         * @description Computes the gp/kill and gp/s data for monsters and dungeons and sets those values.
         */
        updateGPData() {
                //Set data for monsters in combat zones
                combatAreas.forEach(area => {
                        area.monsters.forEach(monster => {
                                if (this.monsterSimData[monster].simSuccess) {
                                        this.monsterSimData[monster].gpPerKill = this.computeMonsterValue(monster);
                                        this.monsterSimData[monster].gpPerSecond = this.monsterSimData[monster].gpPerKill / this.monsterSimData[monster].killTimeS;
                                } else {
                                        this.monsterSimData[monster].gpPerKill = 0;
                                        this.monsterSimData[monster].gpPerSecond = 0;
                                }
                        })
                })
                //Set data for dungeons
                for (let i = 0; i < DUNGEONS.length; i++) {
                        if (this.dungeonSimData[i].simSuccess) {
                                this.dungeonSimData[i].gpPerKill = this.computeDungeonValue(i);
                                this.dungeonSimData[i].gpPerSecond = this.dungeonSimData[i].gpPerKill / this.dungeonSimData[i].killTimeS;
                        } else {
                                this.dungeonSimData[i].gpPerKill = 0;
                                this.dungeonSimData[i].gpPerSecond = 0;
                        }
                }
        }
        updateSlayerXP() {
                //Set data for monsters in combat zones
                combatAreas.forEach(area => {
                        area.monsters.forEach(monster => {
                                if (this.monsterSimData[monster].simSuccess) {
                                        let monsterXP = 0;
                                        monsterXP += Math.floor(((MONSTERS[monster].slayerXP != undefined) ? MONSTERS[monster].slayerXP : 0) * (1 + this.simSlayerXPBonus / 100));
                                        if (this.isSlayerTask) {
                                                monsterXP += Math.floor(MONSTERS[monster].hitpoints * (1 + this.simSlayerXPBonus / 100))
                                        }
                                        this.monsterSimData[monster].slayerXpPerSecond = monsterXP / this.monsterSimData[monster].killTimeS;
                                } else {
                                        this.monsterSimData[monster].slayerXpPerSecond = 0;
                                }
                        })
                })
        }
}

/**
 * @description Class for the cards in the bottom of the ui
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
                newButton.type = 'button';
                newButton.id = `MCS ${buttonText} Button`;
                newButton.className = 'mcsButton';
                newButton.style.width = `${width}px`;
                newButton.style.height = `${height}px`;
                newButton.textContent = buttonText;
                newButton.onclick = onclickCallback;
                this.container.appendChild(newButton);
                this.buttons.push(newButton);
        }
        /**
         * @description Creates a new button with the image
         * @param {string} imageSource Source of the image on the button
         * @param {string} idText Text to put in the id of the button
         * @param {function} onclickCallback Callback when clicking the button
         * @param {number} width Width of the button and image in px 
         * @param {number} height Height of the button and image in px
         * @param {HTMLElement} tooltip
         */
        createImageButton(imageSource, idText, onclickCallback, width, height, tooltip) {
                var newButton = document.createElement('button');
                newButton.type = 'button';
                newButton.id = `MCS ${idText} Button`;
                newButton.className = 'mcsImageButton';
                newButton.onclick = onclickCallback;
                let newImage = document.createElement('img');
                newImage.className = 'mcsButtonImage';
                newImage.src = imageSource;
                newImage.width = width;
                newImage.height = height;
                newButton.appendChild(newImage);
                return newButton;
        }
        addMultiImageButton(sources, idtexts, height, width, onclickCallbacks) {
                let toolTips = [];
                let newCCContainer = document.createElement('div');
                newCCContainer.className = 'mcsMultiImageButtonContainer';
                for (let i = 0; i < sources.length; i++) {
                        let newButton = this.createImageButton(sources[i], idtexts[i], onclickCallbacks[i], width, height);
                        toolTips.push(this.addTooltip(newButton));
                        newCCContainer.appendChild(newButton);
                }
                this.container.appendChild(newCCContainer);
                return toolTips;
        }
        /**
         * 
         * @param {string} labelText 
         * @param {string[]} optionText 
         * @param {any[]} optionValues 
         * @param {number} height 
         */
        addDropdown(labelText, optionText, optionValues, height, onChangeCallback) {
                var dropDownID = `MCS ${labelText} Dropdown`;
                var newCCContainer = this.createCCContainer(height);
                newCCContainer.id = `${dropDownID} Container`;
                newCCContainer.appendChild(this.createLabel(labelText, dropDownID));
                var newDropdown = this.createDropdown(optionText, optionValues, dropDownID, onChangeCallback)
                newCCContainer.appendChild(newDropdown);
                this.container.appendChild(newCCContainer);
        }

        createDropdown(optionText, optionValues, dropDownID, onChangeCallback) {
                var newDropdown = document.createElement('select');
                newDropdown.className = 'mcsDropdown';
                newDropdown.style.width = this.inputWidth;
                newDropdown.id = dropDownID;
                for (let i = 0; i < optionText.length; i++) {
                        let newOption = document.createElement('option');
                        newOption.text = optionText[i];
                        newOption.value = optionValues[i];
                        newOption.className = 'mcsOption';
                        newDropdown.add(newOption);
                }
                newDropdown.addEventListener('change', onChangeCallback);
                this.dropDowns.push(newDropdown);
                return newDropdown
        }

        addNumberInput(labelText, startValue, height, min, max, onChangeCallback) {
                var inputID = `MCS ${labelText} Input`;
                var newCCContainer = this.createCCContainer(height);
                newCCContainer.appendChild(this.createLabel(labelText, inputID));
                var newInput = document.createElement('input');
                newInput.id = inputID;
                newInput.type = 'number';
                newInput.min = min;
                newInput.max = max;
                newInput.value = startValue;
                newInput.className = 'mcsNumberInput';
                newInput.style.width = this.inputWidth;
                newInput.addEventListener('change', onChangeCallback);
                newCCContainer.appendChild(newInput);
                this.container.appendChild(newCCContainer);
        }

        addTextInput(labelText, startValue, height, onInputCallback) {
                var inputID = `MCS ${labelText} TextInput`;
                var newCCContainer = this.createCCContainer(height);
                newCCContainer.appendChild(this.createLabel(labelText, inputID));
                var newInput = document.createElement('input');
                newInput.id = inputID;
                newInput.type = 'text';
                newInput.value = startValue;
                newInput.className = 'mcsTextInput';
                newInput.style.width = this.inputWidth;
                newInput.addEventListener('input', onInputCallback);
                newCCContainer.appendChild(newInput);
                this.container.appendChild(newCCContainer);
        }

        addNumberOutput(labelText, initialValue, height, imageSrc, outputID) {
                if (!outputID) {
                        var outputID = `MCS ${labelText} Output`;
                }
                var newCCContainer = this.createCCContainer(height);
                if (imageSrc && imageSrc != '') {
                        newCCContainer.appendChild(this.createImage(imageSrc, height));
                }

                newCCContainer.appendChild(this.createLabel(labelText, outputID));

                var newOutput = document.createElement('div');
                newOutput.className = 'mcsNumberOutput';
                newOutput.style.width = this.inputWidth;
                newOutput.textContent = initialValue;
                newOutput.id = outputID;
                newCCContainer.appendChild(newOutput);

                this.container.appendChild(newCCContainer);
                this.numOutputs.push(newOutput)
        }

        addSectionTitle(titleText, titleID) {
                var newSectionTitle = document.createElement('div');
                if (titleID) {
                        newSectionTitle.id = titleID;
                }
                newSectionTitle.textContent = titleText;
                newSectionTitle.className = 'mcsSectionTitle';
                newSectionTitle.style.width = this.width;

                this.container.appendChild(newSectionTitle);
        }

        addMultiButton(buttonText, height, width, buttonCallbacks) {
                var newButton;
                var newCCContainer = document.createElement('div');
                newCCContainer.className = 'mcsMultiButtonContainer';
                newCCContainer.style.height = `${height}px`;
                for (let i = 0; i < buttonText.length; i++) {
                        var newButton = document.createElement('button');
                        newButton.type = 'button';
                        newButton.id = `MCS ${buttonText[i]} Button`;
                        newButton.className = 'mcsNoMargin mcsButton';
                        newButton.style.width = `${width}px`;
                        newButton.style.height = '100%';
                        newButton.textContent = buttonText[i];
                        newButton.onclick = buttonCallbacks[i];
                        this.buttons.push(newButton);
                        newCCContainer.appendChild(newButton);
                }
                this.container.appendChild(newCCContainer);
        }

        addRadio(labelText, height, radioName, radioLabels, radioCallbacks, radioDef, imageSrc) {
                var newCCContainer = this.createCCContainer(height);
                if (imageSrc && imageSrc != '') {
                        newCCContainer.appendChild(this.createImage(imageSrc, height));
                }
                newCCContainer.appendChild(this.createLabel(labelText, ''));
                newCCContainer.id = `MCS ${labelText} Radio Container`;
                var radioContainer = document.createElement('div');
                radioContainer.className = 'mcsRadioContainer';
                radioContainer.style.width = this.inputWidth;
                newCCContainer.appendChild(radioContainer);
                //Create Radio elements with labels
                for (let i = 0; i < radioLabels.length; i++) {
                        radioContainer.appendChild(this.createRadio(radioName, radioLabels[i], `MCS ${labelText} Radio ${radioLabels[i]}`, radioDef == i, radioCallbacks[i]));
                }
                this.container.appendChild(newCCContainer);
        }

        createRadio(radioName, radioLabel, radioID, checked, radioCallback) {
                var newDiv = document.createElement('div');
                newDiv.appendChild(this.createLabel(radioLabel, radioID));
                var newRadio = document.createElement('input');
                newRadio.type = 'radio';
                newRadio.id = radioID;
                newRadio.name = radioName;
                if (checked) {
                        newRadio.checked = true;
                }
                newRadio.addEventListener('change', radioCallback);
                newDiv.appendChild(newRadio);
                return newDiv
        }

        createCCContainer(height) {
                var newCCContainer = document.createElement('div');
                newCCContainer.className = 'mcsCCContainer';
                newCCContainer.style.height = `${height}px`;
                var fillerDiv = document.createElement('div');
                fillerDiv.className = 'mcsFlexFiller';
                newCCContainer.appendChild(fillerDiv);
                return newCCContainer;
        }

        createLabel(labelText, referenceID) {
                var newLabel = document.createElement('label');
                newLabel.className = 'mcsLabel';
                // newLabel.style.width = this.labelWidth;
                newLabel.textContent = labelText;
                newLabel.for = referenceID;
                return newLabel;
        }
        /**
         * 
         * @param {string} imageSrc source of image
         * @param {number} height in pixels 
         */
        createImage(imageSrc, height) {
                var newImage = document.createElement('img');
                newImage.style.height = `${height}px`;
                newImage.src = imageSrc;
                return newImage;
        }
        addTooltip(parent) {
                let newTooltip = document.createElement('div');
                newTooltip.className = 'mcsTooltip';
                newTooltip.style.display = 'none';
                parent.addEventListener('mouseenter', e => this.showTooltip(e, newTooltip));
                parent.addEventListener('mouseleave', e => this.hideTooltip(e, newTooltip));
                parent.appendChild(newTooltip);
                return newTooltip;
        }
        //Prebaked functions for tooltips
        hideTooltip(e, tooltip) {
                tooltip.style.display = 'none';
        }
        showTooltip(e, tooltip) {
                tooltip.style.display = '';
        }
}
/**
 * @description Formats a number with the specified number of decimals, padding with 0s
 * @param {number} number Number
 * @param {number} numDecimals Number of decimals
 * @returns {string}
 */
function mcsFormatNum(number, numDecimals) {
        var outStr = number.toString(10);
        var lengthFront = Math.trunc(number).toString(10).length;
        var lengthEnd = outStr.length - lengthFront - ((outStr.length == lengthFront) ? 1 : 0);
        var expectedLength = lengthFront + numDecimals + ((numDecimals == 0) ? 0 : 1);
        if (outStr.length == lengthFront && numDecimals > 0) {
                //String has no decimal and is expected to
                outStr += '.';
        } else if (lengthEnd > numDecimals) {
                //String has too many decimals and needs to be rounded
                var roundPos = lengthFront + numDecimals + 1;
                if (outStr.charCodeAt(roundPos) > 52) {
                        //Round up
                        roundPos--;
                        var isRounded = false;
                        while (!isRounded) {
                                //Hit the decimal decrease round position
                                if (outStr.charCodeAt(roundPos) == 46) {
                                        roundPos--;
                                }
                                if (outStr.charCodeAt(roundPos) == 57) {
                                        //Case for rounding up a 9
                                        outStr = outStr.substring(0, roundPos) + '0' + outStr.substring(roundPos + 1);
                                        if (roundPos == 0) {
                                                outStr = '1' + outStr;
                                                expectedLength++;
                                                isRounded = true;
                                        }
                                        roundPos--;
                                } else {
                                        outStr = outStr.substring(0, roundPos) + String.fromCharCode(outStr.charCodeAt(roundPos) + 1) + outStr.substring(roundPos + 1);
                                        isRounded = true;
                                }
                        }
                }
                //Truncate string
                outStr = outStr.substr(0, expectedLength);
        }
        return outStr.padEnd(expectedLength, '0')
}
// Wait for page to finish loading, then create an instance of the combat sim
var melvorCombatSim;
const melvorCombatSimLoader = setInterval(() => {
        if (isLoaded) {
                clearInterval(melvorCombatSimLoader);
                let tryLoad = true;
                let wrongVersion = false;
                if (gameVersion != "Alpha v0.11.2") {
                        wrongVersion = true;
                        tryLoad = window.confirm('Melvor Combat Simulator\nA different game version was detected. Loading the combat sim may cause unexpected behaviour or result in inaccurate simulation results.\n Try loading it anyways?');
                }
                if (tryLoad) {
                        try {
                                melvorCombatSim = new mcsApp();
                                if (wrongVersion) {
                                        console.log('Melvor Combat Sim v0.4.2 Loaded, but simulation results may be inaccurate.')
                                } else {
                                        console.log('Melvor Combat Sim v0.4.2 Loaded');
                                }
                        } catch (error) {
                                console.warn('Melvor Combat Sim was not properly loaded due to the following error:')
                                console.error(error);
                        }
                } else {
                        console.warn('Melvor Combat Sim was not Loaded due to game version incompatability.')
                }
        }
}, 200);

//Todo list:
//Add reflect damage

//Future Features List:
//Monster/Dungeon Inspecter: Shows information about a monster/dungeon including: Levels, Equip Stats, Combat Stats, Drop Table, Drop Chance, Drop Quantity, Bone Type, Gold Amount, Attack Type
//Ability to save and load gear sets, some initial work is done
//Save and load functions for combat sim data in localstorage
//Note on saving the sale list: will need to transfer it over everytime we load the game since it could change with updates
//Ability to optimize a leveling path/calculate the time it takes to get from x level to y level
//No spoiler mode (Use item completion)