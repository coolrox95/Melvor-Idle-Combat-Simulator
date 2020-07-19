/*  Melvor Combat Simulator v0.9.1: Adds a combat simulator to Melvor Idle

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

/**
 * Container Class for the Combat Simulator.
 * A single instance of this is initiated on load.
 */
class McsApp {
  /**
   * Constructs an instance of mcsApp
   * @param {Object} urls URLs from content script
   * @param {string} urls.simulationWorker URL for simulator script
   * @param {string} urls.crossedOut URL for crossed out svg
   */
  constructor(urls) {
    // Plot Type Options
    this.plotTypeDropdownOptions = ['XP per ',
      'HP XP per ',
      'Prayer XP per ',
      'Slayer XP per ',
      'XP per Attack',
      'HP Loss per ',
      'Prayer Points per ',
      'Damage per ',
      'Average Kill Time (s)',
      'Damage per Attack',
      'GP per Kill',
      'GP per ',
      'Potential Herblore XP per ',
      'Chance for Signet Part B(%)',
      'Attacks Made per ',
      'Attacks Taken per ',
      'Simulation Time'];
    this.plotTypeIsTime = [true,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      false,
      false,
      false,
      true,
      true,
      false,
      true,
      true,
      false];
    this.plotTypeDropdownValues = ['xpPerSecond',
      'hpxpPerSecond',
      'prayerXpPerSecond',
      'slayerXpPerSecond',
      'xpPerHit',
      'hpPerSecond',
      'ppConsumedPerSecond',
      'dmgPerSecond',
      'killTimeS',
      'avgHitDmg',
      'gpPerKill',
      'gpPerSecond',
      'herbloreXPPerSecond',
      'signetChance',
      'attacksMadePerSecond',
      'attacksTakenPerSecond',
      'simulationTime'];
    this.zoneInfoNames = ['XP/',
      'HP XP/',
      'Prayer XP/',
      'Slayer XP/',
      'XP/attack',
      'HP Lost/',
      'Prayer Points/',
      'Damage/',
      'Kill Time(s)',
      'Damage/attack',
      'GP/kill',
      'GP/',
      'Herb XP/',
      'Signet Chance (%)',
      'Attacks Made/',
      'Attacks Taken/',
      'Sim Time'];
    this.emptyItems = {
      Helmet: {
        name: 'None',
        itemID: 0,
        media: 'assets/media/bank/armour_helmet.svg',
        defenceLevelRequired: 0,
        magicLevelRequired: 0,
        rangedLevelRequired: 0,
      },
      Platebody: {
        name: 'None',
        itemID: 0,
        media: 'assets/media/bank/armour_platebody.svg',
        defenceLevelRequired: 0,
        magicLevelRequired: 0,
        rangedLevelRequired: 0,
      },
      Platelegs: {
        name: 'None',
        itemID: 0,
        media: 'assets/media/bank/armour_platelegs.svg',
        defenceLevelRequired: 0,
        magicLevelRequired: 0,
        rangedLevelRequired: 0,
      },
      Boots: {
        name: 'None',
        itemID: 0,
        media: 'assets/media/bank/armour_boots.svg',
        defenceLevelRequired: 0,
        magicLevelRequired: 0,
        rangedLevelRequired: 0,
      },
      Weapon: {
        name: 'None',
        itemID: 0,
        media: 'assets/media/bank/weapon_sword.svg',
        attackLevelRequired: 0,
        magicLevelRequired: 0,
        rangedLevelRequired: 0,
      },
      Shield: {
        name: 'None',
        itemID: 0,
        media: 'assets/media/bank/armour_shield.svg',
        defenceLevelRequired: 0,
        magicLevelRequired: 0,
        rangedLevelRequired: 0,
      },
      Amulet: {
        name: 'None',
        itemID: 0,
        media: 'assets/media/bank/misc_amulet.svg',
      },
      Ring: {
        name: 'None',
        itemID: 0,
        media: 'assets/media/bank/misc_ring.svg',
      },
      Gloves: {
        name: 'None',
        itemID: 0,
        media: 'assets/media/bank/armour_gloves.svg',
        defenceLevelRequired: 0,
        magicLevelRequired: 0,
        rangedLevelRequired: 0,
      },
      Quiver: {
        name: 'None',
        itemID: 0,
        media: 'assets/media/bank/weapon_quiver.svg',
      },
      Cape: {
        name: 'None',
        itemID: 0,
        media: 'assets/media/bank/armour_cape.svg',
      },
    };
    // Generate gear subsets
    this.slotKeys = Object.keys(CONSTANTS.equipmentSlot);
    this.gearSubsets = [];
    /** @type {Array<number>} */
    this.gearSelected = [];
    for (let j = 0; j < this.slotKeys.length; j++) {
      this.gearSubsets.push([this.emptyItems[this.slotKeys[j]]]);
      this.gearSelected.push(0);
      for (let i = 0; i < items.length; i++) {
        if (items[i].equipmentSlot == CONSTANTS.equipmentSlot[this.slotKeys[j]]) {
          this.gearSubsets[j].push(items[i]);
          this.gearSubsets[j][this.gearSubsets[j].length - 1].itemID = i;
        }
      }
    }
    // Add ammoType 2 and 3 to weapon subsets
    for (let i = 0; i < items.length; i++) {
      if (items[i].equipmentSlot == CONSTANTS.equipmentSlot.Quiver && (items[i].ammoType == 2 || items[i].ammoType == 3)) {
        this.gearSubsets[CONSTANTS.equipmentSlot.Weapon].push(items[i]);
        this.gearSubsets[CONSTANTS.equipmentSlot.Weapon][this.gearSubsets[CONSTANTS.equipmentSlot.Weapon].length - 1].itemID = i;
      }
    }
    // Sort Gear Subsets
    for (let j = 0; j < this.slotKeys.length; j++) {
      this.gearSubsets[j].sort((a, b) => {
        return ((a.attackLevelRequired) ? a.attackLevelRequired : 0) - ((b.attackLevelRequired) ? b.attackLevelRequired : 0);
      });
      this.gearSubsets[j].sort((a, b) => {
        return ((a.defenceLevelRequired) ? a.defenceLevelRequired : 0) - ((b.defenceLevelRequired) ? b.defenceLevelRequired : 0);
      });
      this.gearSubsets[j].sort((a, b) => {
        return ((a.rangedLevelRequired) ? a.rangedLevelRequired : 0) - ((b.rangedLevelRequired) ? b.rangedLevelRequired : 0);
      });
      this.gearSubsets[j].sort((a, b) => {
        return ((a.magicLevelRequired) ? a.magicLevelRequired : 0) - ((b.magicLevelRequired) ? b.magicLevelRequired : 0);
      });
      if (j == CONSTANTS.equipmentSlot.Quiver) {
        this.gearSubsets[j].sort((a, b) => {
          return ((a.ammoType) ? a.ammoType : -1) - ((b.ammoType) ? b.ammoType : -1);
        });
      };
    }
    this.skillKeys = ['Attack', 'Strength', 'Defence', 'Hitpoints', 'Ranged', 'Magic', 'Prayer', 'Slayer'];
    // Simulation Object
    this.simulator = new McsSimulator(this, urls.simulationWorker);
    // Temporary GP/s settings variable
    this.itemSubsetTemp = [];

    // Create the top container for the sim
    this.topContent = document.createElement('div');
    this.topContent.className = 'mcsTabContent';
    this.topContent.id = 'MCS Top Content';

    // Add listeners for changing page to not the sim
    document.getElementsByClassName('nav-main-link').forEach((element)=>{
      if (element.href.includes('changePage')) {
        element.addEventListener('click', ()=>this.hideSim());
      }
    });
    document.getElementsByClassName('btn btn-sm btn-light btn-combat-minibar-hp')[0].addEventListener('click', ()=>this.hideSim());
    // This code will insert a tab into the actual sidebar
    const newHeading = document.createElement('li');
    newHeading.className = 'nav-main-heading mcsNoSelect';
    newHeading.textContent = 'Tools ';
    this.headingEye = document.createElement('i');
    this.headingEye.className = 'far fa-eye text-muted ml-1';
    this.headingEye.onclick = (e) => this.headingEyeOnClick(e);
    this.headingEye.style.cursor = 'pointer';
    newHeading.appendChild(this.headingEye);
    this.eyeHidden = false;

    this.tabDiv = document.createElement('li');
    this.tabDiv.style.cursor = 'pointer';
    this.tabDiv.className = 'nav-main-item mcsNoSelect';

    document.getElementsByClassName('nav-main-heading').forEach((heading) => {
      if (heading.textContent == 'Skills ') {
        heading.parentElement.insertBefore(newHeading, heading);
        heading.parentElement.insertBefore(this.tabDiv, heading);
      }
    });
    const elem2 = document.createElement('a');
    elem2.className = 'nav-main-link nav-compact';
    elem2.onclick = () => melvorCombatSim.tabOnClick();
    this.tabDiv.appendChild(elem2);
    const elem3 = document.createElement('img');
    elem3.className = 'nav-img';
    elem3.src = 'assets/media/skills/combat/combat.svg';
    elem2.appendChild(elem3);
    const elem4 = document.createElement('span');
    elem4.className = 'nav-main-link-name';
    elem4.textContent = 'Combat Simulator';
    elem2.appendChild(elem4);

    // Add Cards to the container
    // Gear/Level/Style/Spell Selection Card:
    {
      this.gearLevelCard = new McsCard(this.topContent, '345px', '', '150px');
      this.gearLevelCard.addSectionTitle('Equipment');
      const gearRows = [
        [CONSTANTS.equipmentSlot.Helmet],
        [CONSTANTS.equipmentSlot.Cape, CONSTANTS.equipmentSlot.Amulet, CONSTANTS.equipmentSlot.Quiver],
        [CONSTANTS.equipmentSlot.Weapon, CONSTANTS.equipmentSlot.Platebody, CONSTANTS.equipmentSlot.Shield],
        [CONSTANTS.equipmentSlot.Platelegs],
        [CONSTANTS.equipmentSlot.Gloves, CONSTANTS.equipmentSlot.Boots, CONSTANTS.equipmentSlot.Ring],
      ];
      gearRows.forEach((gearRow)=>{
        const rowSources = [];
        const rowIDs = [];
        const rowPopups = [];
        gearRow.forEach((gearID)=>{
          rowSources.push(this.emptyItems[this.slotKeys[gearID]].media);
          rowIDs.push(`MCS ${this.slotKeys[gearID]} Gear Image`);
          rowPopups.push(this.createGearPopup(gearID));
        });
        this.gearLevelCard.addMultiPopupMenu(rowSources, rowIDs, 40, 40, rowPopups);
      });
      this.gearLevelCard.addSectionTitle('Import Gear Set');
      this.gearLevelCard.addMultiButton(['1', '2', '3'], 25, 80, [()=>this.importButtonOnClick(0), ()=>this.importButtonOnClick(1), ()=>this.importButtonOnClick(2)]);
      this.gearLevelCard.addSectionTitle('Player Levels');
      this.skillKeys.forEach((element) => {
        let minLevel = 1;
        if (element == 'Hitpoints') {
          minLevel = 10;
        }
        this.gearLevelCard.addNumberInput(element, `${minLevel}`, 24, minLevel, 99, (event) => this.levelInputOnChange(event, element));
      });
      this.gearLevelCard.addSectionTitle('Combat Style');
      // Style dropdown (Specially Coded)
      const combatStyleCCContainer = this.gearLevelCard.createCCContainer(24);
      const combatStyleLabel = this.gearLevelCard.createLabel('Style: ', '');
      const meleeStyleDropdown = this.gearLevelCard.createDropdown(['Stab', 'Slash', 'Block'], [0, 1, 2], 'MCS Melee Style Dropdown', (event) => this.styleDropdownOnChange(event, 'Melee'));
      const rangedStyleDropdown = this.gearLevelCard.createDropdown(['Accurate', 'Rapid', 'Longrange'], [0, 1, 2], 'MCS Ranged Style Dropdown', (event) => this.styleDropdownOnChange(event, 'Ranged'));
      const magicStyleDropdown = this.gearLevelCard.createDropdown(['Magic', 'Defensive'], [0, 1], 'MCS Magic Style Dropdown', (event) => this.styleDropdownOnChange(event, 'Magic'));
      rangedStyleDropdown.style.display = 'none';
      magicStyleDropdown.style.display = 'none';
      combatStyleCCContainer.appendChild(combatStyleLabel);
      combatStyleCCContainer.appendChild(meleeStyleDropdown);
      combatStyleCCContainer.appendChild(rangedStyleDropdown);
      combatStyleCCContainer.appendChild(magicStyleDropdown);
      this.gearLevelCard.container.appendChild(combatStyleCCContainer);
      // Spell dropdown
      const spellOpts = [];
      const spellVals = [];
      for (let i = 0; i < SPELLS.length; i++) {
        spellOpts.push(this.getSpellName(i));
        spellVals.push(i);
      }
      this.gearLevelCard.addDropdown('Spell', spellOpts, spellVals, 25, (event) => this.spellDropdownOnChange(event));
    }
    // Potion & Prayer Selection Card:
    {
      this.prayerPotionCard = new McsCard(this.topContent, '200px', '', '100px');
      this.prayerPotionCard.container.style.width = '200px';
      this.prayerPotionCard.addSectionTitle('Prayers');
      const prayerSources = [];
      const prayerNames = [];
      const prayerCallbacks = [];
      for (let i = 0; i < PRAYER.length; i++) {
        prayerSources.push(PRAYER[i].media);
        prayerNames.push(this.getPrayerName(i));
        prayerCallbacks.push((e) => this.prayerButtonOnClick(e, i));
      }
      const prayerTooltips = this.prayerPotionCard.addMultiImageButton(prayerSources, prayerNames, 24, 24, prayerCallbacks);
      // Generate the tooltip contents
      const prayerBonusDictionary = {
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
        prayerBonusProtectFromMelee: `${protectFromValue}% chance to dodge Melee Attacks`,
        prayerBonusProtectFromRanged: `${protectFromValue}% chance to dodge Ranged Attacks`,
        prayerBonusProtectFromMagic: `${protectFromValue}% chance to dodge Magic Attacks`,
        prayerBonusHitpointHeal: 'Heal +20% HP when HP falls below 10%',
        prayerBonusDamageReduction: 'Damage Reduction',
      };

      const prayerBonusNumeric = {
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
        prayerBonusDamageReduction: true,
      };
      for (let i = 0; i < PRAYER.length; i++) {
        const tipTitle = document.createElement('span');
        tipTitle.className = 'mcsTTTitle';
        tipTitle.textContent = this.getPrayerName(i);
        prayerTooltips[i].appendChild(tipTitle);
        const div1 = document.createElement('div');
        div1.className = 'mcsTTDivider';
        prayerTooltips[i].appendChild(div1);
        for (let j = 0; j < PRAYER[i].vars.length; j++) {
          const bonusText = document.createElement('span');
          bonusText.className = 'mcsTTText';
          const prayerBonus = PRAYER[i].vars[j];
          if (prayerBonusNumeric[prayerBonus]) {
            bonusText.textContent = `+${PRAYER[i].values[j]}% ${prayerBonusDictionary[prayerBonus]}`;
          } else {
            bonusText.textContent = prayerBonusDictionary[prayerBonus];
          }
          prayerTooltips[i].appendChild(bonusText);
          prayerTooltips[i].appendChild(document.createElement('br'));
        }
        if (PRAYER[i].pointsPerPlayer > 0) {
          const prayerXPBonus = document.createElement('span');
          prayerXPBonus.className = 'mcsTTText';
          prayerXPBonus.textContent = `+${(2 / numberMultiplier * PRAYER[i].pointsPerPlayer).toFixed(2)} prayer xp per damage done`;
          prayerTooltips[i].appendChild(prayerXPBonus);
        }
        const div2 = document.createElement('div');
        div2.className = 'mcsTTDivider';
        prayerTooltips[i].appendChild(div2);
        // Prayer point costs
        if (PRAYER[i].pointsPerEnemy > 0) {
          const prayerCost = document.createElement('span');
          prayerCost.className = 'mcsTTText';
          prayerCost.textContent = `Costs: ${PRAYER[i].pointsPerEnemy} per enemy attack`;
          prayerTooltips[i].appendChild(prayerCost);
        }
        if (PRAYER[i].pointsPerPlayer > 0) {
          const prayerCost = document.createElement('span');
          prayerCost.className = 'mcsTTText';
          prayerCost.textContent = `Costs: ${PRAYER[i].pointsPerPlayer} per player attack`;
          prayerTooltips[i].appendChild(prayerCost);
        }
        if (PRAYER[i].pointsPerRegen > 0) {
          const prayerCost = document.createElement('span');
          prayerCost.className = 'mcsTTText';
          prayerCost.textContent = `Costs: ${PRAYER[i].pointsPerRegen} per HP regen`;
          prayerTooltips[i].appendChild(prayerCost);
        }
      }

      // Potion Selection
      this.prayerPotionCard.addSectionTitle('Potions');
      this.prayerPotionCard.addDropdown('Potion Tier', ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'], [0, 1, 2, 3], 25, (e) => this.potionTierDropDownOnChange(e));

      const potionSources = [];
      const potionNames = [];
      const potionCallbacks = [];
      /** @type {Array<number>} */
      this.combatPotionIDs = [];
      for (let i = 0; i < herbloreItemData.length; i++) {
        if (herbloreItemData[i].category == 0) {
          potionSources.push(items[herbloreItemData[i].itemID[0]].media);
          potionNames.push(this.getPotionName(i));
          potionCallbacks.push((e) => this.potionImageButtonOnClick(e, i));
          this.combatPotionIDs.push(i);
        }
      }
      this.potionTooltips = {
        /** @type {Array<HTMLDivElement>} */
        divs: [],
        /** @type {Array<HTMLSpanElement>} */
        titles: [],
        /** @type {Array<HTMLSpanElement>} */
        descriptions: [],
        /** @type {Array<HTMLSpanElement>} */
        charges: [],
      };
      this.potionTooltips.divs = this.prayerPotionCard.addMultiImageButton(potionSources, potionNames, 24, 24, potionCallbacks);
      for (let i = 0; i < this.combatPotionIDs.length; i++) {
        const potionID = this.combatPotionIDs[i];
        // Potion  Title
        this.potionTooltips.titles.push(document.createElement('span'));
        this.potionTooltips.titles[i].className = 'mcsTTTitle';
        this.potionTooltips.titles[i].textContent = this.getItemName(herbloreItemData[potionID].itemID[0]);
        this.potionTooltips.divs[i].appendChild(this.potionTooltips.titles[i]);
        const div1 = document.createElement('div');
        div1.className = 'mcsTTDivider';
        this.potionTooltips.divs[i].appendChild(div1);
        // Potion Description
        this.potionTooltips.descriptions.push(document.createElement('span'));
        this.potionTooltips.descriptions[i].className = 'mcsTTText';
        this.potionTooltips.descriptions[i].textContent = items[herbloreItemData[potionID].itemID[0]].description;
        this.potionTooltips.divs[i].appendChild(this.potionTooltips.descriptions[i]);
        const div2 = document.createElement('div');
        div2.className = 'mcsTTDivider';
        this.potionTooltips.divs[i].appendChild(div2);
        // Potion Charges
        this.potionTooltips.charges.push(document.createElement('span'));
        this.potionTooltips.charges[i].className = 'mcsTTText';
        this.potionTooltips.charges[i].textContent = `Charges: ${items[herbloreItemData[potionID].itemID[0]].potionCharges}`;
        this.potionTooltips.divs[i].appendChild(this.potionTooltips.charges[i]);
      }
    }
    // Spell selection cards
    {
      this.spellSelectCard = this.createSpellSelectCard('Standard Magic', 'standard');
      this.curseSelectCard = this.createSpellSelectCard('Curses', 'curse');
      this.auroraSelectCard = this.createSpellSelectCard('Auroras', 'aurora');
      this.ancientSelectCard = this.createSpellSelectCard('Ancient Magicks', 'ancient');
    }
    // Pet selection card
    {
      const combatPetsIds = [12, 13, 14, 15, 16, 17, 18, 19, 20];
      const combatPets = PETS.filter((_pet, petID)=>{
        return combatPetsIds.includes(petID);
      });
      this.petSelectCard = new McsCard(this.topContent, '', '', '100px');
      this.petSelectCard.addSectionTitle('Pets');
      const petImageSources = combatPets.map((pet)=>{
        return pet.media;
      });
      const petNames = combatPets.map((pet)=>{
        return pet.name;
      });
      const petButtonCallbacks = combatPets.map((_pet, petID)=>{
        return (e)=>this.petButtonOnClick(e, petID);
      });
      const petTooltips = this.petSelectCard.addMultiImageButton(petImageSources, petNames, 24, 24, petButtonCallbacks, 176);
      petTooltips.forEach((tooltip, petID)=>{
        const newSpan = document.createElement('span');
        newSpan.className = 'mcsTTTitle';
        newSpan.textContent = petNames[petID];
        tooltip.appendChild(newSpan);
      });
    }
    // Gear Stats/Player Stats Display Card
    {
      this.statDisplayCard = new McsCard(this.topContent, '220px', '', '50px');
      this.statDisplayCard.addSectionTitle('Equipment Stats');
      this.equipStatKeys = ['attackSpeed',
        'strengthBonus',
        'attBon0',
        'attBon1',
        'attBon2',
        'rangedAttackBonus',
        'rangedStrengthBonus',
        'magicAttackBonus',
        'magicDamageBonus',
        'defenceBonus',
        'damageReduction',
        'rangedDefenceBonus',
        'magicDefenceBonus',
        'attackLevelRequired',
        'defenceLevelRequired',
        'rangedLevelRequired',
        'magicLevelRequired'];
      const equipStatNames = ['Attack Speed',
        'Strength Bonus',
        'Stab Bonus',
        'Slash Bonus',
        'Block Bonus',
        'Attack Bonus',
        'Strength Bonus',
        'Attack Bonus',
        '% Damage Bonus',
        'Defence Bonus',
        'Damage Reduction',
        'Defence Bonus',
        'Defence Bonus',
        'Level Required',
        'Level Required',
        'Level Required',
        'Level Required'];
      const equipStatIcons = ['combat',
        'strength',
        'attack',
        'strength',
        'defence',
        'ranged',
        'ranged',
        'magic',
        'magic',
        'defence',
        'defence',
        'ranged',
        'magic',
        'attack',
        'defence',
        'ranged',
        'magic'];
      const iconSources = {
        combat: 'assets/media/skills/combat/combat.svg',
        attack: 'assets/media/skills/combat/attack.svg',
        strength: 'assets/media/skills/combat/strength.svg',
        ranged: 'assets/media/skills/ranged/ranged.svg',
        magic: 'assets/media/skills/magic/magic.svg',
        defence: 'assets/media/skills/defence/defence.svg',
      };
      for (let i = 0; i < equipStatNames.length; i++) {
        this.statDisplayCard.addNumberOutput(equipStatNames[i], 0, 20, iconSources[equipStatIcons[i]], `MCS ${this.equipStatKeys[i]} ES Output`);
      }
      this.statDisplayCard.addSectionTitle('Combat Stats');
      const combatStatNames = ['Attack Speed',
        'Max Hit',
        'Accuracy Rating',
        'Evasion Rating',
        'Evasion Rating',
        'Evasion Rating',
        'Damage Reduction'];
      const combatStatIcons = ['', '', '', 'combat', 'ranged', 'magic', ''];
      this.combatStatKeys = ['attackSpeed',
        'maxHit',
        'maxAttackRoll',
        'maxDefRoll',
        'maxRngDefRoll',
        'maxMagDefRoll',
        'damageReduction'];
      for (let i = 0; i < combatStatNames.length; i++) {
        this.statDisplayCard.addNumberOutput(combatStatNames[i], 0, 20, (combatStatIcons[i] != '') ? iconSources[combatStatIcons[i]] : '', `MCS ${this.combatStatKeys[i]} CS Output`);
      }
    }
    // Simulation/Plot Options Card
    {
      this.simOptionsCard = new McsCard(this.topContent, '275px', '', '150px');
      this.simOptionsCard.addSectionTitle('Simulation Options');
      this.simOptionsCard.addNumberInput('Max Hits', 1000, 25, 1, 10000, (event) => this.maxhitsInputOnChange(event));
      this.simOptionsCard.addNumberInput('# Trials', 10000, 25, 1, 100000, (event) => this.numtrialsInputOnChange(event));
      this.timeOptions = ['Second', 'Minute', 'Hour', 'Day'];
      this.timeShorthand = ['s', 'm', 'h', 'd'];
      this.selectedTimeUnit = this.timeOptions[0];
      this.selectedTimeShorthand = this.timeShorthand[0];
      this.timeMultipliers = [1, 60, 3600, 3600 * 24];
      this.simOptionsCard.addDropdown('Time Unit', this.timeOptions, this.timeMultipliers, 25, (event) => this.timeUnitDropdownOnChange(event));
      this.simOptionsCard.addNumberInput('Signet Time (h)', 1, 25, 1, 1000, (event) => this.signetTimeInputOnChange(event));
      const dropDownOptionNames = [];
      for (let i = 0; i < this.plotTypeDropdownOptions.length; i++) {
        if (this.plotTypeIsTime[i]) {
          dropDownOptionNames.push(this.plotTypeDropdownOptions[i] + this.timeOptions[0]);
        } else {
          dropDownOptionNames.push(this.plotTypeDropdownOptions[i]);
        }
      }
      this.simOptionsCard.addDropdown('Plot Type', dropDownOptionNames, this.plotTypeDropdownValues, 25, (event) => this.plottypeDropdownOnChange(event));
      this.simOptionsCard.addRadio('Slayer Task?', 25, 'slayerTask', ['Yes', 'No'], [(e) => this.slayerTaskRadioOnChange(e, true), (e) => this.slayerTaskRadioOnChange(e, false)], 1);
      this.simOptionsCard.addRadio('Hardcore Mode?', 25, 'hardcore', ['Yes', 'No'], [() => this.hardcoreRadioOnChange(true), () => this.hardcoreRadioOnChange(false)], 1);
      this.simOptionsCard.addButton('Simulate', (event) => this.simulateButtonOnClick(event), 250, 25);
      this.simOptionsCard.addButton('Cancel', () => this.cancelButtonOnClick(), 250, 25);
      this.simOptionsCard.addButton('Export Data', (event) => this.exportDataOnClick(event), 250, 25);
      this.simOptionsCard.addButton('Show Export Options >', (event) => this.exportOptionsOnClick(event), 250, 25);
      this.simOptionsCard.addSectionTitle('GP/s Options');
      this.simOptionsCard.addRadio('Sell Bones', 25, 'sellBones', ['Yes', 'No'], [(e) => this.sellBonesRadioOnChange(e, true), (e) => this.sellBonesRadioOnChange(e, false)], 1);
      this.simOptionsCard.addRadio('Convert Shards', 25, 'convertShards', ['Yes', 'No'], [(e) => this.convertShardsRadioOnChange(e, true), (e) => this.convertShardsRadioOnChange(e, false)], 1);
      this.simOptionsCard.addDropdown('Sell Loot', ['All', 'Subset', 'None'], ['All', 'Subset', 'None'], 25, (e) => this.sellLootDropdownOnChange(e));
      this.simOptionsCard.addButton('Edit Subset', (e) => this.editSubsetButtonOnClick(e), 250, 25);
    }
    // GP/s options card
    {
      this.gpOptionsCard = new McsCard(this.topContent, '320px', '', '200px');
      this.gpOptionsCard.addSectionTitle('Item Subset Selection');
      this.gpOptionsCard.addMultiButton(['Set Default', 'Set Discovered'], 25, 150, [(e) => this.setDefaultOnClick(e), (e) => this.setDiscoveredOnClick(e)]);
      this.gpOptionsCard.addMultiButton(['Cancel', 'Save'], 25, 150, [(e) => this.cancelSubsetOnClick(e), (e) => this.saveSubsetOnClick(e)]);
      this.gpOptionsCard.addTextInput('Search:', '', 25, (e) => this.searchInputOnInput(e));
      // Top labels
      const labelCont = document.createElement('div');
      labelCont.className = 'mcsMultiButtonContainer';
      labelCont.style.borderBottom = 'solid thin';
      const lab1 = document.createElement('div');
      lab1.className = 'mcsMultiHeader';
      lab1.style.borderRight = 'solid thin';
      lab1.textContent = 'Item';
      lab1.style.width = '220px';
      labelCont.appendChild(lab1);
      const lab2 = document.createElement('div');
      lab2.className = 'mcsMultiHeader';
      lab2.textContent = 'Sell?';
      lab2.style.width = '100px';
      lab2.style.marginRight = '17px';
      labelCont.appendChild(lab2);
      this.gpOptionsCard.container.appendChild(labelCont);
      this.gpSearchResults = new McsCard(this.gpOptionsCard.container, '', '300px', '100px');
      for (let i = 0; i < this.simulator.lootList.length; i++) {
        this.gpSearchResults.addRadio(this.simulator.lootList[i].name, 20, `${this.simulator.lootList[i].name}-radio`, ['Yes', 'No'], [(e) => this.lootListRadioOnChange(e, i, true), (e) => this.lootListRadioOnChange(e, i, false)], 1);
      }
      this.gpSearchResults.container.style.overflowY = 'scroll';
      this.gpSearchResults.container.style.overflowX = 'hidden';
      this.gpSearchResults.container.style.marginRight = '0px';
      this.gpSearchResults.container.style.marginBottom = '5px';
    }
    // Export Options Card
    {
      this.isExportDisplayed = false;
      this.exportOptionsCard = new McsCard(this.topContent, '320px', '', '100px');
      this.exportOptionsCard.addSectionTitle('Export Options');
      this.exportOptionsCard.addRadio('Export Dungeon Monsters?', 25, `DungeonMonsterExportRadio`, ['Yes', 'No'], [(e) => this.exportDungeonMonsterRadioOnChange(e, true), (e) => this.exportDungeonMonsterRadioOnChange(e, false)], 0);
      this.exportOptionsCard.addRadio('Export Non-Simulated?', 25, `NonSimmedExportRadio`, ['Yes', 'No'], [(e) => this.exportNonSimmedRadioOnChange(e, true), (e) => this.exportNonSimmedRadioOnChange(e, false)], 0);
      this.exportOptionsCard.addSectionTitle('Data to Export');
      this.exportOptionsCard.addRadio('Name', 25, `NameExportRadio`, ['Yes', 'No'], [(e) => this.exportNameRadioOnChange(e, true), (e) => this.exportNameRadioOnChange(e, false)], 0);
      for (let i = 0; i < this.plotTypeDropdownOptions.length; i++) {
        let timeText = '';
        if (this.plotTypeIsTime[i]) {
          timeText = 'X';
        }
        this.exportOptionsCard.addRadio(`${this.zoneInfoNames[i]}${timeText}`, 25, `${this.plotTypeDropdownValues[i]}ExportRadio`, ['Yes', 'No'], [(e) => this.exportDataTypeRadioOnChange(e, true, i), (e) => this.exportDataTypeRadioOnChange(e, false, i)], 0);
      }
    }
    // Bar Chart Card
    this.monsterToggleState = true;
    this.dungeonToggleState = true;
    // Individual info card, nested into sim/plot card
    {
      this.zoneInfoCard = new McsCard(this.topContent, '275px', '', '100px');
      this.zoneInfoCard.container.style.overflow = 'hidden auto';
      this.zoneInfoCard.addSectionTitle('Area Information', 'MCS Zone Info Title');
      this.zoneInfoCard.addNumberOutput('Name', 'N/A', 20, '', `MCS Zone Name Output`);
      const zoneInfoLabelNames = [];
      for (let i = 0; i < this.zoneInfoNames.length; i++) {
        if (this.plotTypeIsTime[i]) {
          zoneInfoLabelNames.push(this.zoneInfoNames[i] + this.timeShorthand[0]);
        } else {
          zoneInfoLabelNames.push(this.zoneInfoNames[i]);
        }
      }
      for (let i = 0; i < this.plotTypeDropdownOptions.length; i++) {
        this.zoneInfoCard.addNumberOutput(zoneInfoLabelNames[i], 'N/A', 20, '', `MCS ${this.plotTypeDropdownValues[i]} Output`, true);
      }
      this.zoneInfoCard.addButton('Inspect Dungeon', (e) => this.inspectDungeonOnClick(e), 250, 25);
    }
    this.plotter = new McsPlotter(this, urls.crossedOut);
    // Setup plotter bar clicking
    this.selectedBar = 0;
    this.barSelected = false;
    for (let i = 0; i < this.plotter.bars.length; i++) {
      this.plotter.bars[i].onclick = ((e) => this.barOnClick(e, i));
    }
    /** @type {Array<number>} */
    this.barMonsterIDs = [];
    /** @type {Array<boolean>} */
    this.barIsDungeon = [];

    combatAreas.forEach((area) => {
      area.monsters.forEach((monster) => {
        this.barMonsterIDs.push(monster);
        this.barIsDungeon.push(false);
      });
    });
    slayerAreas.forEach((area) => {
      area.monsters.forEach((monster) => {
        this.barMonsterIDs.push(monster);
        this.barIsDungeon.push(false);
      });
    });
    /** @type {Array<number>} */
    this.dungeonBarIDs = [];
    for (let i = 0; i < DUNGEONS.length; i++) {
      this.dungeonBarIDs.push(this.barMonsterIDs.length);
      this.barMonsterIDs.push(i);
      this.barIsDungeon.push(true);
    }
    // Dungeon View Variables
    this.isViewingDungeon = false;
    this.viewedDungeonID = -1;

    // Now that everything is done we add it to the document
    document.getElementById('main-container').appendChild(this.topContent);
    // Adjust the widths of the containers
    this.gearLevelCard.setContainerWidths();
    this.prayerPotionCard.setContainerWidths();
    this.statDisplayCard.setContainerWidths();
    this.simOptionsCard.setContainerWidths();
    this.gpOptionsCard.setContainerWidths();
    this.exportOptionsCard.setContainerWidths();
    this.zoneInfoCard.setContainerWidths();
    // Push an update to the displays
    this.topContent.style.display = 'none';
    this.gpOptionsCard.container.style.display = 'none';
    this.exportOptionsCard.container.style.display = 'none';
    this.isVisible = false;
    document.getElementById('MCS Cancel Button').style.display = 'none';
    document.getElementById('MCS Spell Dropdown Container').style.display = 'none';
    document.getElementById('MCS Edit Subset Button').style.display = 'none';
    // Set up spells
    const standardOpts = this.simulator.spells.standard;
    document.getElementById(`MCS ${standardOpts.array[standardOpts.selectedID].name} Button`).className = 'mcsImageButton mcsButtonImageSelected';
    this.simulator.computeEquipStats();
    this.updateEquipStats();
    this.simulator.computeCombatStats();
    this.updateCombatStats();
    this.plotter.updateBarData(this.simulator.getDataSet('xpPerSecond'));
    // Export Options element
    this.exportOptionsButton = document.getElementById('MCS Show Export Options > Button');
    // Saving and loading of Gear Sets
    this.gearSets = [];
  }

  /** Adds a multi-button with gear to the gear select popup
   * @param {McsCard} card The parent card
   * @param {number} gearID The array of gear
   * @param {Function} filterFunction Filter gear with this function
   * @param {string} [sortKey=itemID] Sort gear by this key
   */
  addGearMultiButton(card, gearID, filterFunction, sortKey = 'itemID') {
    const menuItems = this.gearSubsets[gearID].filter(filterFunction);
    menuItems.sort((a, b)=>{
      return ((a[sortKey]) ? a[sortKey] : 0) - ((b[sortKey]) ? b[sortKey] : 0);
    });
    const buttonMedia = menuItems.map((item)=>{
      return item.media;
    });
    const buttonIds = menuItems.map((item)=>{
      return `${this.getItemName(item.itemID)}`;
    });
    const buttonCallbacks = menuItems.map((item)=>{
      return ()=>this.equipItemButton(gearID, item.itemID);
    });
    const multiTooltips = card.addMultiImageButton(buttonMedia, buttonIds, 24, 24, buttonCallbacks, 440);
    multiTooltips.forEach((tooltip, i)=>{
      const newSpan = document.createElement('span');
      newSpan.className = 'mcsTTTitle';
      newSpan.textContent = this.getItemName(menuItems[i].itemID);
      tooltip.appendChild(newSpan);
    });
  }

  /**
   * Creates a card for selecting spells
   * @param {string} title Title of the card
   * @param {string} spellType spell array to generate select menu for
   * @return {McsCard}
   * @memberof McsApp
   */
  createSpellSelectCard(title, spellType) {
    const newCard = new McsCard(this.topContent, '', '', '100px');
    newCard.addSectionTitle(title);
    const spellArray = this.simulator.spells[spellType].array;
    const spellImages = spellArray.map((spell)=>{
      return spell.media;
    });
    const spellNames = spellArray.map((spell)=>{
      return spell.name;
    });
    const spellCallbacks = spellArray.map((_spell, spellID)=>{
      return (event)=>this.spellButtonOnClick(event, spellID, spellType);
    });
    const spellTooltips = newCard.addMultiImageButton(spellImages, spellNames, 24, 24, spellCallbacks, 176);
    spellTooltips.forEach((tooltip, spellID)=>{
      const newSpan = document.createElement('span');
      newSpan.className = 'mcsTTTitle';
      newSpan.textContent = spellNames[spellID];
      tooltip.appendChild(newSpan);
    });
    return newCard;
  }

  /**
   * Filters an array by if the array item has the key
   * @param {string} key
   * @param {Object} item
   * @return {boolean}
   */
  filterIfHasKey(key, item) {
    return key in item || item.itemID === 0;
  }

  /**
   * Filter an item array by the ammoType
   * @param {number} type
   * @param {Object} item
   * @return {boolean}
   */
  filterByAmmoType(type, item) {
    return item.ammoType === type || item.itemID === 0;
  }
  /**
   * Filter an item array by the ammoType
   * @param {number} type
   * @param {Object} item
   * @return {boolean}
   */
  filterByAmmoReq(type, item) {
    return item.ammoTypeRequired === type || item.itemID === 0;
  }

  /**
   * Filter an item if it's twohanded property matches the given state
   * @param {boolean} is2H Filter if twohanded matches this
   * @param {Object} item
   * @return {boolean}
   */
  filterByTwoHanded(is2H, item) {
    return item.isTwoHanded === is2H || item.itemID === 0;
  }

  /**
   * Filter an item by the weapon type
   * @param {string} weaponType
   * @param {Object} item
   * @return {boolean}
   */
  filterByWeaponType(weaponType, item) {
    // Change to the correct combat style selector
    return this.getWeaponType(item) === weaponType || item.itemID === 0;
  }

  /**
   * Gets the weapon type of an item
   * @param {Object} item
   * @return {string}
   */
  getWeaponType(item) {
    if ((item.type === 'Ranged Weapon') || item.isRanged) {
      return 'Ranged';
    } else if (item.isMagic) {
      return 'Magic';
    } else {
      return 'Melee';
    }
  }
  /**
   * Filter by returning all elements
   * @return {boolean}
   */
  returnTrue() {
    return true;
  }

  /**
   * Creates a gear popup
   * @param {number} gearID
   * @return {HTMLDivElement}
   */
  createGearPopup(gearID) {
    const gearSelectPopup = document.createElement('div');
    gearSelectPopup.className = 'mcsPopup';
    const gearSelectCard = new McsCard(gearSelectPopup, '500px', '', '400px');
    const triSplit = [0, 1, 2, 3, 5, 8];
    const noSplit = [6, 7, 10];
    if (triSplit.includes(gearID)) {
      gearSelectCard.addSectionTitle('Melee');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>this.filterIfHasKey('defenceLevelRequired', item), 'defenceLevelRequired');
      gearSelectCard.addSectionTitle('Ranged');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>this.filterIfHasKey('rangedLevelRequired', item), 'rangedLevelRequired');
      gearSelectCard.addSectionTitle('Magic');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>this.filterIfHasKey('magicLevelRequired', item), 'magicLevelRequired');
    } else if (noSplit.includes(gearID)) {
      gearSelectCard.addSectionTitle(this.slotKeys[gearID]);
      this.addGearMultiButton(gearSelectCard, gearID, ()=>this.returnTrue());
    } else if (gearID === 4) {
      gearSelectCard.addSectionTitle('1H Melee');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>{
        return this.filterByTwoHanded(false, item) && this.filterByWeaponType('Melee', item);
      }, 'attackLevelRequired');
      gearSelectCard.addSectionTitle('2H Melee');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>{
        return this.filterByTwoHanded(true, item) && this.filterByWeaponType('Melee', item);
      }, 'attackLevelRequired');
      gearSelectCard.addSectionTitle('Bows');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>{
        return this.filterByAmmoReq(0, item) && this.filterByWeaponType('Ranged', item);
      }, 'rangedLevelRequired');
      gearSelectCard.addSectionTitle('Crossbows');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>{
        return this.filterByAmmoReq(1, item) && this.filterByWeaponType('Ranged', item);
      }, 'rangedLevelRequired');
      gearSelectCard.addSectionTitle('Javelins');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>{
        return this.filterByAmmoReq(2, item) && this.filterByWeaponType('Ranged', item);
      }, 'rangedLevelRequired');
      gearSelectCard.addSectionTitle('Throwing Knives');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>{
        return this.filterByAmmoReq(3, item) && this.filterByWeaponType('Ranged', item);
      }, 'rangedLevelRequired');
      gearSelectCard.addSectionTitle('1H Magic');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>{
        return this.filterByTwoHanded(false, item) && this.filterByWeaponType('Magic', item);
      }, 'magicLevelRequired');
      gearSelectCard.addSectionTitle('2H Magic');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>{
        return this.filterByTwoHanded(true, item) && this.filterByWeaponType('Magic', item);
      }, 'magicLevelRequired');
    } else if (gearID === 9) {
      gearSelectCard.addSectionTitle('Arrows');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>this.filterByAmmoType(0, item), 'rangedLevelRequired');
      gearSelectCard.addSectionTitle('Bolts');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>this.filterByAmmoType(1, item), 'rangedLevelRequired');
      gearSelectCard.addSectionTitle('Javelins');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>this.filterByAmmoType(2, item), 'rangedLevelRequired');
      gearSelectCard.addSectionTitle('Throwing Knives');
      this.addGearMultiButton(gearSelectCard, gearID, (item)=>this.filterByAmmoType(3, item), 'rangedLevelRequired');
    } else {
      throw Error('Invalid gearID');
    }
    return gearSelectPopup;
  }
  /**
   * Callback for when sidebar option is clicked
   */
  tabOnClick() {
    if (!this.isVisible) {
      $('[data-toggle="tooltip"]').tooltip('hide');
      const pages = ['woodcutting', 'shop', 'bank', 'settings', 'changelog', 'milestones', 'statistics', 'fishing', 'firemaking', 'cooking', 'mining', 'smithing', 'mastery', 'combat', 'thieving', 'farming', 'fletching', 'crafting', 'runecrafting', 'herblore', 'archaeology', 'easter', 'caseoffortune'];
      $(`#${pages[currentPage]}-container`).attr('class', 'content d-none');
      $('#header-title').text('Combat Simulator');
      $('#header-icon').attr('src', 'assets/media/skills/combat/combat.svg');
      $('#header-theme').attr('class', 'content-header bg-combat');
      $('#page-header').attr('class', 'bg-combat');
      currentPage = 3;
      if (showCombatMinibar && isInCombat) $('#combat-footer-minibar').removeClass('d-none');
      updatePotionHeader();
      this.topContent.style.display = '';
      this.isVisible = true;
    }
  }
  /**
   * Callback for when another thing with changepage is toggled
   */
  hideSim() {
    if (this.isVisible) {
      this.topContent.style.display = 'none';
      this.isVisible = false;
    }
  }
  /**
   * Callback for when sidebar eye is clicked
   */
  headingEyeOnClick() {
    if (this.eyeHidden) {
      this.headingEye.className = 'far fa-eye text-muted ml-1';
      this.tabDiv.style.display = '';
      this.eyeHidden = false;
    } else {
      this.headingEye.className = 'far fa-eye-slash text-muted ml-1';
      this.tabDiv.style.display = 'none';
      this.eyeHidden = true;
    }
  }
  // Callback Functions for Gear select Card
  /**
   * Equips/unequips an item to a gearslot
   * @param {number} gearID
   * @param {number} itemID
   * @memberof McsApp
   */
  equipItemButton(gearID, itemID) {
    const prevWeapon = this.gearSelected[CONSTANTS.equipmentSlot.Weapon];
    this.gearSelected[gearID] = itemID;
    this.setGearImage(gearID, itemID);
    const item = items[itemID];
    const weaponAmmo = [2, 3];
    switch (gearID) {
      case CONSTANTS.equipmentSlot.Weapon:
        if (item.equipmentSlot === CONSTANTS.equipmentSlot.Quiver) {
          this.gearSelected[CONSTANTS.equipmentSlot.Quiver] = itemID;
          this.setGearImage(CONSTANTS.equipmentSlot.Quiver, itemID);
        } else if (weaponAmmo.includes(items[this.gearSelected[CONSTANTS.equipmentSlot.Quiver]].ammoType)) {
          this.gearSelected[CONSTANTS.equipmentSlot.Quiver] = 0;
          this.setGearImage(CONSTANTS.equipmentSlot.Quiver, 0);
        }
        if (item.isTwoHanded) {
          this.gearSelected[CONSTANTS.equipmentSlot.Shield] = 0;
          this.setGearImage(CONSTANTS.equipmentSlot.Shield, 0);
        }
        break;
      case CONSTANTS.equipmentSlot.Shield:
        if (items[this.gearSelected[CONSTANTS.equipmentSlot.Weapon]].isTwoHanded) {
          this.gearSelected[CONSTANTS.equipmentSlot.Weapon] = 0;
          this.setGearImage(CONSTANTS.equipmentSlot.Weapon, 0);
        }
        break;
      case CONSTANTS.equipmentSlot.Quiver:
        if (weaponAmmo.includes(item.ammoType)) { // Swapping to knife/jav
          this.gearSelected[CONSTANTS.equipmentSlot.Weapon] = itemID;
          this.setGearImage(CONSTANTS.equipmentSlot.Weapon, itemID);
          if (item.isTwoHanded) {
            this.gearSelected[CONSTANTS.equipmentSlot.Shield] = 0;
            this.setGearImage(CONSTANTS.equipmentSlot.Shield, 0);
          }
        } else if (items[this.gearSelected[CONSTANTS.equipmentSlot.Weapon]].equipmentSlot === CONSTANTS.equipmentSlot.Quiver) { // Swapping from knife/jav
          this.gearSelected[CONSTANTS.equipmentSlot.Weapon] = 0;
          this.setGearImage(CONSTANTS.equipmentSlot.Weapon, 0);
        }
        break;
    }
    if (prevWeapon !== this.gearSelected[CONSTANTS.equipmentSlot.Weapon]) {
      this.updateStyleDropdowns();
    }
    this.simulator.computeEquipStats();
    this.updateEquipStats();
    this.simulator.computeCombatStats();
    this.updateCombatStats();
  }

  /**
   * Updates the style selection dropdowns
   * @memberof McsApp
   */
  updateStyleDropdowns() {
    const item = items[this.gearSelected[CONSTANTS.equipmentSlot.Weapon]];
    switch (this.getWeaponType(item)) {
      case 'Ranged':
        this.disableStyleDropdown('Magic');
        this.disableStyleDropdown('Melee');
        this.enableStyleDropdown('Ranged');
        break;
      case 'Magic':
        this.disableStyleDropdown('Ranged');
        this.disableStyleDropdown('Melee');
        this.enableStyleDropdown('Magic');
        break;
      case 'Melee':
        this.disableStyleDropdown('Magic');
        this.disableStyleDropdown('Ranged');
        this.enableStyleDropdown('Melee');
        break;
    }
  }
  /**
   * Changed the gear image
   * @param {number} gearID
   * @param {number} itemID
   */
  setGearImage(gearID, itemID) {
    let newSource;
    const slotKey = this.slotKeys[gearID];
    if (itemID === 0) {
      newSource = this.emptyItems[slotKey].media;
    } else {
      newSource = items[itemID].media;
    }
    document.getElementById(`MCS ${slotKey} Gear Image`).src = newSource;
  }
  /**
   * Callback for when a level input is changed
   * @param {Event} event The change event for an input
   * @param {string} skillName The key of playerLevels to Change
   */
  levelInputOnChange(event, skillName) {
    const newLevel = parseInt(event.currentTarget.value);
    if (newLevel <= 99 && newLevel >= 1) {
      this.simulator.playerLevels[skillName] = newLevel;
      // This is the magic dropdown that has been changed, update spell list
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
  /**
   * Callback for when a combat style is changed
   * @param {Event} event The change event for a dropdown
   * @param {string} combatType The key of styles to change
   */
  styleDropdownOnChange(event, combatType) {
    const styleID = parseInt(event.currentTarget.selectedOptions[0].value);
    this.simulator.attackStyle[combatType] = styleID;
    this.simulator.computeCombatStats();
    this.updateCombatStats();
  }
  /**
   * Callback for when the selected spell is changed
   * @param {Event} event The change event for a dropdown
   */
  spellDropdownOnChange(event) {
    const spellID = parseInt(event.currentTarget.selectedOptions[0].value);
    this.simulator.selectedSpell = spellID;
    this.simulator.computeCombatStats();
    this.updateCombatStats();
  }
  /**
   * Callback for when the import button is clicked
   * @param {number} setID Index of equipmentSets from 0-2 to import
   */
  importButtonOnClick(setID) {
    let itemID;
    const setToImport = equipmentSets[setID].equipment;
    for (let i = 0; i < this.slotKeys.length; i++) {
      itemID = setToImport[CONSTANTS.equipmentSlot[this.slotKeys[i]]];
      this.gearSelected[i] = itemID;
      this.setGearImage(i, itemID);
    }
    this.updateStyleDropdowns();
    // Update levels from in game levels
    this.skillKeys.forEach((key) => {
      document.getElementById(`MCS ${key} Input`).value = skillLevel[CONSTANTS.skill[key]];
      this.simulator.playerLevels[key] = skillLevel[CONSTANTS.skill[key]];
    });
    // Set attack styles for each combat type:
    const meleeStyle = selectedAttackStyle[0];
    this.simulator.attackStyle.Melee = meleeStyle;
    document.getElementById('MCS Melee Style Dropdown').selectedIndex = meleeStyle;
    const rangedStyle = selectedAttackStyle[1];
    this.simulator.attackStyle.Ranged = rangedStyle - 3;
    document.getElementById('MCS Ranged Style Dropdown').selectedIndex = rangedStyle - 3;
    const magicStyle = selectedAttackStyle[2];
    this.simulator.attackStyle.Magic = magicStyle - 6;
    document.getElementById('MCS Magic Style Dropdown').selectedIndex = magicStyle - 6;
    // Update spells
    document.getElementById('MCS Spell Dropdown').selectedIndex = selectedSpell;
    this.simulator.selectedSpell = selectedSpell;
    this.updateSpellOptions(skillLevel[CONSTANTS.skill.Magic]);
    // Update prayers
    this.simulator.activePrayers = 0;
    for (let i = 0; i < PRAYER.length; i++) {
      const prayButton = document.getElementById(`MCS ${this.getPrayerName(i)} Button`);
      if (activePrayer[i]) {
        prayButton.className = 'mcsImageButton mcsButtonImageSelected';
        this.simulator.prayerSelected[i] = true;
        this.simulator.activePrayers++;
      } else {
        prayButton.className = 'mcsImageButton';
        this.simulator.prayerSelected[i] = false;
      }
    }
    // Import Potion
    let potionID = -1;
    let potionTier = -1;
    if (herbloreBonuses[13].itemID != 0) {
      const itemID = herbloreBonuses[13].itemID;
      // Get tier and potionID
      for (let i = 0; i < herbloreItemData.length; i++) {
        if (herbloreItemData[i].category == 0) {
          for (let j = 0; j < herbloreItemData[i].itemID.length; j++) {
            if (herbloreItemData[i].itemID[j] == itemID) {
              potionID = i;
              potionTier = j;
            }
          }
        }
      }
    }
    // Deselect potion if selected
    if (this.simulator.potionSelected) {
      document.getElementById(`MCS ${this.getPotionName(this.simulator.potionID)} Button`).className = 'mcsImageButton';
      this.simulator.potionSelected = false;
      this.simulator.potionID = -1;
    }
    // Select new potion if applicable
    if (potionID != -1) {
      this.simulator.potionSelected = true;
      this.simulator.potionID = potionID;
      document.getElementById(`MCS ${this.getPotionName(this.simulator.potionID)} Button`).className = 'mcsImageButton mcsButtonImageSelected';
    }
    // Set potion tier if applicable
    if (potionTier != -1) {
      this.simulator.potionTier = potionTier;
      this.updatePotionTier(potionTier);
      // Set dropdown to correct option
      document.getElementById('MCS Potion Tier Dropdown').selectedIndex = potionTier;
    }

    this.updatePrayerOptions(skillLevel[CONSTANTS.skill.Prayer]);
    this.simulator.computeEquipStats();
    this.updateEquipStats();
    this.simulator.computePotionBonus();
    this.simulator.computePrayerBonus();
    this.simulator.computeCombatStats();
    this.updateCombatStats();
  }
  // Callback Functions for the Prayer Select Card
  /**
   * Callback for when a prayer image button is clicked
   * @param {MouseEvent} event The onclick event for a button
   * @param {number} prayerID Index of prayerSelected
   */
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
        notifyPlayer(CONSTANTS.skill.Prayer, 'You can only have 2 prayers active at once.', 'danger');
      }
    }
    if (prayerChanged) {
      this.simulator.computePrayerBonus();
      this.simulator.computeCombatStats();
      this.updateCombatStats();
    }
  }
  /**
   * Callback for when the potion tier is changed
   * @param {Event} event The change event for a dropdown
   */
  potionTierDropDownOnChange(event) {
    const potionTier = parseInt(event.currentTarget.selectedOptions[0].value);
    this.simulator.potionTier = potionTier;
    this.simulator.computePotionBonus();
    this.simulator.computeCombatStats();
    this.updateCombatStats();
    this.updatePotionTier(potionTier);
  }
  /**
   * Callback for when a potion button is clicked
   * @param {MouseEvent} event The onclick event for a button
   * @param {number} potionID The ID of the potion
   */
  potionImageButtonOnClick(event, potionID) {
    if (this.simulator.potionSelected) {
      if (this.simulator.potionID == potionID) { // Deselect Potion
        this.simulator.potionSelected = false;
        this.simulator.potionID = -1;
        event.currentTarget.className = 'mcsImageButton';
      } else { // Change Potion
        document.getElementById(`MCS ${this.getPotionName(this.simulator.potionID)} Button`).className = 'mcsImageButton';
        this.simulator.potionID = potionID;
        event.currentTarget.className = 'mcsImageButton mcsButtonImageSelected';
      }
    } else { // Select Potion
      this.simulator.potionSelected = true;
      this.simulator.potionID = potionID;
      event.currentTarget.className = 'mcsImageButton mcsButtonImageSelected';
    }
    this.simulator.computePotionBonus();
    this.simulator.computeCombatStats();
    this.updateCombatStats();
  }
  // Callback Functions for the spell select buttons
  /**
   * Callback for when a spell is selected
   * @param {MouseEvent} event
   * @param {number} spellID
   * @param {string} spellType
   */
  spellButtonOnClick(event, spellID, spellType) {
    const spellOpts = this.simulator.spells[spellType];
    // Special Cases: If Ancient or Standard deselect standard/anciennt
    // If Ancient deselect curses
    // If curse and ancient active, do not select
    if (spellOpts.isSelected) {
      // Spell of type already selected
      if (spellOpts.selectedID === spellID && spellType !== 'standard' && spellType !== 'ancient') {
        spellOpts.isSelected = false;
        spellOpts.selectedID = -1;
        event.currentTarget.className = 'mcsImageButton';
      } else {
        document.getElementById(`MCS ${spellOpts.array[spellOpts.selectedID].name} Button`).className = 'mcsImageButton';
        spellOpts.selectedID = spellID;
        event.currentTarget.className = 'mcsImageButton mcsButtonImageSelected';
      }
    } else {
      switch (spellType) {
        case 'ancient':
          const standardOpts = this.simulator.spells.standard;
          standardOpts.isSelected = false;
          document.getElementById(`MCS ${standardOpts.array[standardOpts.selectedID].name} Button`).className = 'mcsImageButton';
          standardOpts.selectedID = -1;
          if (this.simulator.spells.curse.isSelected) {
            const curseOpts = this.simulator.spells.curse;
            curseOpts.isSelected = false;
            document.getElementById(`MCS ${curseOpts.array[curseOpts.selectedID].name} Button`).className = 'mcsImageButton';
            curseOpts.selectedID = -1;
            notifyPlayer(CONSTANTS.skill.Magic, 'Curse Deselected, they cannot be used with Ancient Magicks', 'danger');
          }
          break;
        case 'standard':
          const ancientOpts = this.simulator.spells.ancient;
          ancientOpts.isSelected = false;
          document.getElementById(`MCS ${ancientOpts.array[ancientOpts.selectedID].name} Button`).className = 'mcsImageButton';
          ancientOpts.selectedID = -1;
          break;
      }
      // Spell of type not selected
      if (spellType === 'curse' && this.simulator.spells.ancient.isSelected) {
        notifyPlayer(CONSTANTS.skill.Magic, 'Curses cannot be used with Ancient Magicks', 'danger');
      } else {
        spellOpts.isSelected = true;
        spellOpts.selectedID = spellID;
        event.currentTarget.className = 'mcsImageButton mcsButtonImageSelected';
      }
    }
    // Insert neccessary stat and UI updates here
  }
  // Callback Functions for the pet select card
  /**
   *
   * @param {MouseEvent} event
   * @param {number} petID
   */
  petButtonOnClick(event, petID) {
    if (this.simulator.petOwned[petID]) {
      this.simulator.petOwned[petID] = false;
      event.currentTarget.className = 'mcsImageButton';
    } else {
      this.simulator.petOwned[petID] = true;
      event.currentTarget.className = 'mcsImageButton mcsButtonImageSelected';
    }
  }
  // Callback Functions for the Sim Options Card
  /**
   * Callback for when the max hit input is changed
   * @param {Event} event The change event for an input
   */
  maxhitsInputOnChange(event) {
    const newMaxHit = parseInt(event.currentTarget.value);
    if (newMaxHit > 0 && newMaxHit <= 10000) {
      this.simulator.Nhitmax = newMaxHit;
    }
  }
  /**
   * Callback for when the number of trials input is changed
   * @param {Event} event The change event for an input
   */
  numtrialsInputOnChange(event) {
    const newNumTrials = parseInt(event.currentTarget.value);
    if (newNumTrials > 0 && newNumTrials <= 100000) {
      this.simulator.Ntrials = newNumTrials;
    }
  }
  /**
   * Callback for when the plot type is changed
   * @param {Event} event The change event for a dropdown
   */
  plottypeDropdownOnChange(event) {
    this.plotter.plotType = event.currentTarget.value;
    this.plotter.plotID = event.currentTarget.selectedIndex;
    this.simulator.selectedPlotIsTime = this.plotTypeIsTime[event.currentTarget.selectedIndex];
    this.updatePlotTitle();
    this.plotter.updateBarData(this.simulator.getDataSet(event.currentTarget.value));
  }
  /**
   * Callback for when the simulate button is clicked
   * @param {MouseEvent} event The onclick event for a button
   */
  simulateButtonOnClick(event) {
    if (((items[this.gearSelected[CONSTANTS.equipmentSlot.Weapon]].type === 'Ranged Weapon') || items[this.gearSelected[CONSTANTS.equipmentSlot.Weapon]].isRanged) && (items[this.gearSelected[CONSTANTS.equipmentSlot.Weapon]].ammoTypeRequired != items[this.gearSelected[CONSTANTS.equipmentSlot.Quiver]].ammoType)) {
      notifyPlayer(CONSTANTS.skill.Ranged, 'Incorrect Ammo type equipped for weapon.', 'danger');
    } else {
      if (!this.simulator.simInProgress && this.simulator.simulationWorkers.length === this.simulator.maxThreads) {
        document.getElementById('MCS Simulate Button').disabled = true;
        const cancelButton = document.getElementById('MCS Cancel Button');
        cancelButton.style.display = '';
        cancelButton.disabled = false;
        cancelButton.textContent = 'Cancel';
        this.simulator.simulateCombat();
      }
    }
  }
  /**
   * Callback for when the cancel simulation button is clicked
   * @memberof McsApp
   */
  cancelButtonOnClick() {
    const cancelButton = document.getElementById('MCS Cancel Button');
    cancelButton.disabled = true;
    cancelButton.textContent = 'Cancelling...';
    this.simulator.cancelSimulation();
  }
  /**
   * Callback for when the sell bones option is changed
   * @param {Event} event The change event for a radio
   * @param {boolean} newState The new value for the option
   */
  sellBonesRadioOnChange(event, newState) {
    this.simulator.sellBones = newState;
    this.updatePlotForGP();
  }
  /**
   * Callback for when the convert shards option is changed
   * @param {Event} event The change event for a radio
   * @param {boolean} newState The new value for the option
   */
  convertShardsRadioOnChange(event, newState) {
    this.simulator.convertShards = newState;
    this.updatePlotForGP();
  }
  /**
   * Callback for when the slayer task option is changed
   * @param {Event} event The change event for a radio
   * @param {boolean} newState The new value for the option
   */
  slayerTaskRadioOnChange(event, newState) {
    this.simulator.isSlayerTask = newState;
    this.updatePlotForSlayerXP();
  }

  /**
   * Callback for when the hardcore option is changed
   * @param {boolean} newState The new value for the option
   */
  hardcoreRadioOnChange(newState) {
    this.simulator.isHardcore = newState;
  }
  /**
   * Callback for when an export data type option is changed
   * @param {Event} event The event for a radio
   * @param {boolean} newState The new value for the option
   * @param {number} exportIndex The index of the data type
   */
  exportDataTypeRadioOnChange(event, newState, exportIndex) {
    this.simulator.exportDataType[exportIndex] = newState;
  }
  /**
   * Callback for when the export name option is changed
   * @param {Event} event The event for a radio
   * @param {boolean} newState The new value for the option
   */
  exportNameRadioOnChange(event, newState) {
    this.simulator.exportName = newState;
  }
  /**
   * Callback for when the export dungeon monsters option is changed
   * @param {Event} event The event for a radio
   * @param {boolean} newState The new value for the option
   */
  exportDungeonMonsterRadioOnChange(event, newState) {
    this.simulator.exportDungeonMonsters = newState;
  }
  /**
   * Callback for when the export non simmed option is changed
   * @param {Event} event The event for a radio
   * @param {boolean} newState The new value for the option
   */
  exportNonSimmedRadioOnChange(event, newState) {
    this.simulator.exportNonSimmed = newState;
  }
  /**
   * Callback for when the sell loot dropdown is changed
   * @param {Event} event The onchange event for a dropdown
   */
  sellLootDropdownOnChange(event) {
    this.simulator.sellLoot = event.currentTarget.value;
    if (this.simulator.sellLoot == 'Subset') {
      document.getElementById('MCS Edit Subset Button').style.display = 'block';
    } else {
      document.getElementById('MCS Edit Subset Button').style.display = 'none';
    }
    this.updatePlotForGP();
  }
  /**
   * The callback for when the edit subset button is clicked
   */
  editSubsetButtonOnClick() {
    this.simulator.setLootListToSaleList();
    this.updateLootListRadios();
    this.gpOptionsCard.container.style.display = 'flex';
  }
  // Callback Functions for the GP Options Card
  /**
   * The callback for when the set sale list to default button is clicked
   */
  setDefaultOnClick() {
    this.simulator.setLootListToDefault();
    this.updateLootListRadios();
  }
  /**
   * The callback for when the set sale list to discovered button is clicked
   */
  setDiscoveredOnClick() {
    this.simulator.setLootListToDiscovered();
    this.updateLootListRadios();
  }
  /**
   * The callback for when cancelling the changes to the sale list
   */
  cancelSubsetOnClick() {
    this.gpOptionsCard.container.style.display = 'none';
  }
  /**
   * The callback for when saving the changes to the sale list
   */
  saveSubsetOnClick() {
    this.simulator.setSaleListToLootList();
    this.updatePlotForGP();
    this.gpOptionsCard.container.style.display = 'none';
  }
  /**
   * The callback for when the sale list search field is changed
   * @param {InputEvent} event The input event
   */
  searchInputOnInput(event) {
    this.updateGPSubset(event.currentTarget.value);
  }
  /**
   * The callback for when an item is toggled for sale
   * @param {Event} event The onchange event for a radio
   * @param {number} llID Loot list index
   * @param {boolean} newState The new value of the option
   */
  lootListRadioOnChange(event, llID, newState) {
    this.simulator.lootList[llID].sell = newState;
  }
  /**
   * The callback for when the signet farm time is changed
   * @param {Event} event The change event for an input
   */
  signetTimeInputOnChange(event) {
    const newFarmTime = parseInt(event.currentTarget.value);
    if (newFarmTime > 0 && newFarmTime <= 1000) {
      this.simulator.signetFarmTime = newFarmTime;
    }
    this.updatePlotForSignetChance();
  }
  /**
   * The callback for when the time unit dropdown is changed
   * @param {Event} event The change event for a dropdown
   */
  timeUnitDropdownOnChange(event) {
    this.simulator.timeMultiplier = this.timeMultipliers[event.currentTarget.selectedIndex];
    this.simulator.selectedPlotIsTime = this.plotTypeIsTime[this.plotter.plotID];
    this.selectedTimeUnit = this.timeOptions[event.currentTarget.selectedIndex];
    this.selectedTimeShorthand = this.timeShorthand[event.currentTarget.selectedIndex];
    // Update dropdown options
    const plotDropdown = document.getElementById(`MCS Plot Type Dropdown`);
    for (let i = 0; i < this.plotTypeDropdownOptions.length; i++) {
      if (this.plotTypeIsTime[i]) {
        plotDropdown[i].textContent = this.plotTypeDropdownOptions[i] + this.selectedTimeUnit;
        document.getElementById(`MCS ${this.zoneInfoNames[i] + this.timeShorthand[0]} Label`).textContent = this.zoneInfoNames[i] + this.selectedTimeShorthand;
      }
    }
    // Update Plot
    this.updatePlotTitle();
    this.plotter.updateBarData(this.simulator.getDataSet(this.plotter.plotType));
    // Update Info Card
    this.updateZoneInfoCard();
  }
  /**
   * The callback for when the export button is clicked
   */
  exportDataOnClick() {
    navigator.clipboard.writeText(this.simulator.exportData()).then(() => {
      return;
    }, (error) => {
      throw error;
    });
  }
  /**
   * The callback for when the show/hide export options button is clicked
   */
  exportOptionsOnClick() {
    if (this.isExportDisplayed) {
      this.exportOptionsCard.container.style.display = 'none';
      this.exportOptionsButton.textContent = 'Show Export Options >';
    } else {
      this.exportOptionsCard.container.style.display = '';
      this.exportOptionsButton.textContent = 'Hide Export Options <';
    }
    this.isExportDisplayed = !this.isExportDisplayed;
  }
  // Callback Functions for Bar inspection
  /**
   * The callback for when the inspect dungeon button is clicked
   */
  inspectDungeonOnClick() {
    if (this.barSelected && this.barIsDungeon[this.selectedBar]) {
      this.setPlotToDungeon(this.barMonsterIDs[this.selectedBar]);
    } else {
      console.warn('How did you click this?');
    }
  }
  /**
   * The callback for when the stop dungeon inspection button is clicked
   */
  stopInspectOnClick() {
    this.setPlotToGeneral();
  }
  /**
   * The callback for when a plotter bar is clicked
   * @param {MouseEvent} event The onclick event
   * @param {number} barID The id of the bar
   */
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
  /**
   * Turns on the border for a bar
   * @param {number} barID The id of the bar
   */
  setBarHighlight(barID) {
    if (this.plotter.bars[barID].className == 'mcsBar') {
      this.plotter.bars[barID].style.border = 'thin solid red';
    } else {
      this.plotter.bars[barID].style.border = 'thin solid blue';
    }
  }
  /**
   * Turns off the border for a bar
   * @param {number} barID The id of the bar
   */
  removeBarhighlight(barID) {
    this.plotter.bars[barID].style.border = 'none';
  }
  /**
   * Callback for when a monster/dungeon image below a bar is clicked
   * @param {number} imageID The id of the image that was clicked
   */
  barImageOnClick(imageID) {
    if (!this.isViewingDungeon) {
      let newState;
      if (this.barIsDungeon[imageID]) {
        this.simulator.dungeonSimFilter[this.barMonsterIDs[imageID]] = !this.simulator.dungeonSimFilter[this.barMonsterIDs[imageID]];
        newState = this.simulator.dungeonSimFilter[this.barMonsterIDs[imageID]];
      } else {
        this.simulator.monsterSimFilter[this.barMonsterIDs[imageID]] = !this.simulator.monsterSimFilter[this.barMonsterIDs[imageID]];
        newState = this.simulator.monsterSimFilter[this.barMonsterIDs[imageID]];
      }
      // UI Changes
      if (newState) {
        // Uncross
        this.plotter.unCrossOutBarImage(imageID);
      } else {
        // Crossout
        this.plotter.crossOutBarImage(imageID);
        if (this.selectedBar == imageID) {
          this.barSelected = false;
          this.removeBarhighlight(imageID);
        }
      }
      this.updatePlotData();
    }
  }
  /**
   * Cabllback to toggle the simulation of dungeons
   */
  toggleDungeonSims() {
    const newState = !this.dungeonToggleState;
    this.dungeonToggleState = newState;
    for (let i = 0; i < DUNGEONS.length; i++) {
      this.simulator.dungeonSimFilter[i] = newState;
    }
    this.updatePlotData();
    this.plotter.crossImagesPerSetting();
  }
  /**
   * Callback to toggle the simulation of monsters in combat and slayer areas
   */
  toggleMonsterSims() {
    const newState = !this.monsterToggleState;
    this.monsterToggleState = newState;
    // Create List of non-dungeon monsters
    combatAreas.forEach((area)=>{
      area.monsters.forEach((monsterID)=>{
        this.simulator.monsterSimFilter[monsterID] = newState;
      });
    });
    slayerAreas.forEach((area)=>{
      area.monsters.forEach((monsterID)=>{
        this.simulator.monsterSimFilter[monsterID] = newState;
      });
    });
    this.updatePlotData();
    this.plotter.crossImagesPerSetting();
  }
  /**
   * Updates the bars in the plot to the currently selected plot type
   */
  updatePlotData() {
    this.plotter.updateBarData(this.simulator.getDataSet(document.getElementById('MCS Plot Type Dropdown').selectedOptions[0].value));
  }
  /**
   * Updates the zone info card text fields
   */
  updateZoneInfoCard() {
    if (this.barSelected) {
      this.zoneInfoCard.container.style.display = '';
      if (this.isViewingDungeon) {
        const monsterList = this.simulator.condensedDungeonMonsters[this.viewedDungeonID];
        const dataIndex = this.selectedBar + monsterList.length - this.plotter.bars.length;
        const monsterID = monsterList[dataIndex].id;
        document.getElementById('MCS Zone Info Title').textContent = 'Monster Information';
        document.getElementById(`MCS Zone Name Output`).textContent = this.getMonsterName(monsterID);
        document.getElementById('MCS Inspect Dungeon Button').style.display = 'none';
        const updateInfo = this.simulator.monsterSimData[monsterID].simSuccess;
        for (let i = 0; i < this.plotTypeDropdownValues.length; i++) {
          const outElem = document.getElementById(`MCS ${this.plotTypeDropdownValues[i]} Output`);
          const dataMultiplier = (this.plotTypeIsTime[i]) ? this.simulator.timeMultiplier : 1;
          if (this.plotTypeDropdownValues[i] == 'killTimeS') {
            outElem.textContent = ((updateInfo) ? mcsFormatNum(this.simulator.monsterSimData[monsterID][this.plotTypeDropdownValues[i]] * dataMultiplier * monsterList[dataIndex].quantity, 4) : 'N/A');
          } else {
            outElem.textContent = ((updateInfo) ? mcsFormatNum(this.simulator.monsterSimData[monsterID][this.plotTypeDropdownValues[i]] * dataMultiplier, 4) : 'N/A');
          }
        }
      } else {
        if (this.barIsDungeon[this.selectedBar]) {
          document.getElementById('MCS Zone Info Title').textContent = 'Dungeon Information';
          document.getElementById(`MCS Zone Name Output`).textContent = this.getDungeonName(this.barMonsterIDs[this.selectedBar]);
          document.getElementById('MCS Inspect Dungeon Button').style.display = '';
          const updateInfo = this.simulator.dungeonSimData[this.barMonsterIDs[this.selectedBar]].simSuccess;
          for (let i = 0; i < this.plotTypeDropdownValues.length; i++) {
            const outElem = document.getElementById(`MCS ${this.plotTypeDropdownValues[i]} Output`);
            const dataMultiplier = (this.plotTypeIsTime[i]) ? this.simulator.timeMultiplier : 1;
            outElem.textContent = ((updateInfo) ? mcsFormatNum(this.simulator.dungeonSimData[this.barMonsterIDs[this.selectedBar]][this.plotTypeDropdownValues[i]] * dataMultiplier, 4) : 'N/A');
          }
        } else {
          document.getElementById('MCS Zone Info Title').textContent = 'Monster Information';
          document.getElementById(`MCS Zone Name Output`).textContent = this.getMonsterName(this.barMonsterIDs[this.selectedBar]);
          document.getElementById('MCS Inspect Dungeon Button').style.display = 'none';
          const updateInfo = this.simulator.monsterSimData[this.barMonsterIDs[this.selectedBar]].simSuccess;
          for (let i = 0; i < this.plotTypeDropdownValues.length; i++) {
            const outElem = document.getElementById(`MCS ${this.plotTypeDropdownValues[i]} Output`);
            const dataMultiplier = (this.plotTypeIsTime[i]) ? this.simulator.timeMultiplier : 1;
            outElem.textContent = ((updateInfo) ? mcsFormatNum(this.simulator.monsterSimData[this.barMonsterIDs[this.selectedBar]][this.plotTypeDropdownValues[i]] * dataMultiplier, 4) : 'N/A');
          }
        }
      }
    } else {
      this.zoneInfoCard.container.style.display = 'none';
    }
  }
  // Functions that manipulate the UI
  /**
   * Toggles the display of a style dropdown, and the spell selection dropdown off
   * @param {string} combatType The combat type to disable
   */
  disableStyleDropdown(combatType) {
    document.getElementById(`MCS ${combatType} Style Dropdown`).style.display = 'none';
    if (combatType == 'Magic') {
      document.getElementById('MCS Spell Dropdown Container').style.display = 'none';
    }
  }
  /**
   * Toggles the display of a style dropdown, and the spell selection dropdown on
   * @param {string} combatType The combat type to enable
   */
  enableStyleDropdown(combatType) {
    document.getElementById(`MCS ${combatType} Style Dropdown`).style.display = 'inline';
    if (combatType == 'Magic') {
      document.getElementById('MCS Spell Dropdown Container').style.display = 'flex';
    }
  }
  /**
   * Updates the list of options in the spell dropdown, based on if the player can use it
   * @param {number} magicLevel The magic level the player has
   */
  updateSpellOptions(magicLevel) {
    const spellDropdown = document.getElementById('MCS Spell Dropdown');
    spellDropdown.children.forEach((child) => {
      if (SPELLS[parseInt(child.value)].magicLevelRequired <= magicLevel) {
        child.style.display = '';
      } else {
        child.style.display = 'none';
      }
    });
  }
  /**
   * Updates the prayers that display in the prayer selection card, based on if the player can use it
   * @param {number} prayerLevel The prayer level the player has
   */
  updatePrayerOptions(prayerLevel) {
    for (let i = 0; i < PRAYER.length; i++) {
      if (PRAYER[i].prayerLevel > prayerLevel) {
        document.getElementById(`MCS ${this.getPrayerName(i)} Button`).style.display = 'none';
      } else {
        document.getElementById(`MCS ${this.getPrayerName(i)} Button`).style.display = '';
      }
    }
  }
  /**
   * Updates the text fields for the stats provided by equipment
   */
  updateEquipStats() {
    let newStatValue;
    for (let i = 0; i < this.equipStatKeys.length; i++) {
      if (this.equipStatKeys[i] == 'attBon0') {
        newStatValue = this.simulator.equipStats.attackBonus[0];
      } else if (this.equipStatKeys[i] == 'attBon1') {
        newStatValue = this.simulator.equipStats.attackBonus[1];
      } else if (this.equipStatKeys[i] == 'attBon2') {
        newStatValue = this.simulator.equipStats.attackBonus[2];
      } else {
        newStatValue = this.simulator.equipStats[this.equipStatKeys[i]];
      }
      document.getElementById(`MCS ${this.equipStatKeys[i]} ES Output`).textContent = newStatValue;
    }
  }
  /**
   * Updates the text fields for the computed combat stats
   */
  updateCombatStats() {
    this.combatStatKeys.forEach((key) => {
      document.getElementById(`MCS ${key} CS Output`).textContent = this.simulator.combatStats[key];
    });
  }
  /**
   * Updates the simulator display for when a gp option is changed
   */
  updatePlotForGP() {
    this.simulator.updateGPData();
    if (this.plotter.plotType == 'gpPerKill') {
      this.plotter.updateBarData(this.simulator.getDataSet('gpPerKill'));
    } else if (this.plotter.plotType == 'gpPerSecond') {
      this.plotter.updateBarData(this.simulator.getDataSet('gpPerSecond'));
    }
    this.updateZoneInfoCard();
  }
  /**
   * Updates the simulator display for when the slayer task option is changed
   */
  updatePlotForSlayerXP() {
    this.simulator.updateSlayerXP();
    if (this.plotter.plotType == 'slayerXpPerSecond') {
      this.plotter.updateBarData(this.simulator.getDataSet('slayerXpPerSecond'));
    }
    this.updateZoneInfoCard();
  }
  /**
   * Updates the simulator display for when the signet time option is changed
   */
  updatePlotForSignetChance() {
    this.simulator.updateSignetChance();
    if (this.plotter.plotType == 'signetChance') {
      this.plotter.updateBarData(this.simulator.getDataSet('signetChance'));
    }
    this.updateZoneInfoCard();
  }
  /**
   * Updates the title above the plot
   */
  updatePlotTitle() {
    if (this.simulator.selectedPlotIsTime) {
      this.plotter.plotTitle.textContent = this.plotTypeDropdownOptions[this.plotter.plotID] + this.selectedTimeUnit;
    } else {
      this.plotter.plotTitle.textContent = this.plotTypeDropdownOptions[this.plotter.plotID];
    }
  }
  /**
   * Updates the images and tooltips for potions when the potion tier is changed
   * @param {number} potionTier The new potion tier
   */
  updatePotionTier(potionTier) {
    for (let i = 0; i < this.combatPotionIDs.length; i++) {
      const potionID = this.combatPotionIDs[i];
      // Update potion images
      document.getElementById(`MCS ${this.getPotionName(potionID)} Button Image`).src = items[herbloreItemData[potionID].itemID[potionTier]].media;
      // Update potion tooltips
      // Potion  Title
      this.potionTooltips.titles[i].textContent = this.getItemName(herbloreItemData[potionID].itemID[potionTier]);
      // Potion Description
      this.potionTooltips.descriptions[i].textContent = items[herbloreItemData[potionID].itemID[potionTier]].description;
      // Potion Charges
      this.potionTooltips.charges[i].textContent = `Charges: ${items[herbloreItemData[potionID].itemID[potionTier]].potionCharges}`;
    }
  }
  /**
  * Updates the display of the sale list radio options depending on what the user has searched
  * @param {string} searchString The search query
  */
  updateGPSubset(searchString) {
    searchString = searchString.toLowerCase();
    let lootname;
    this.simulator.lootList.forEach((loot) => {
      lootname = loot.name.toLowerCase();
      if (lootname.includes(searchString)) {
        document.getElementById(`MCS ${loot.name} Radio Container`).style.display = 'flex';
      } else {
        document.getElementById(`MCS ${loot.name} Radio Container`).style.display = 'none';
      }
    });
  }
  /**
   * Updates the display of sale list radios to match the internal state
   */
  updateLootListRadios() {
    this.simulator.lootList.forEach((item) => {
      if (item.sell) {
        document.getElementById(`MCS ${item.name} Radio Yes`).checked = true;
        document.getElementById(`MCS ${item.name} Radio No`).checked = false;
      } else {
        document.getElementById(`MCS ${item.name} Radio Yes`).checked = false;
        document.getElementById(`MCS ${item.name} Radio No`).checked = true;
      }
    });
  }
  // Functions for dungeon display
  /**
   * Changes the simulator to display an individual dungeon
   * @param {number} dungeonID the index of the dungeon in DUNGEONS
   */
  setPlotToDungeon(dungeonID) {
    this.isViewingDungeon = true;
    this.viewedDungeonID = dungeonID;
    this.simulator.updateGPData();
    this.simulator.updateSignetChance();
    this.simulator.updateSlayerXP();
    this.simulator.updateHerbloreXP();
    this.updatePlotData();
    this.plotter.setBarColours(this.simulator.getEnterSet());
    // Undo bar selection if needed
    if (this.barSelected) {
      this.barSelected = false;
      this.removeBarhighlight(this.selectedBar);
    }
    this.updateZoneInfoCard();
    this.plotter.displayDungeon(dungeonID);
  }
  /**
   * Changes the simulator to display non-dungeon monsters and dungeon summary results
   */
  setPlotToGeneral() {
    this.isViewingDungeon = false;
    this.simulator.updateGPData();
    this.simulator.updateSignetChance();
    this.simulator.updateSlayerXP();
    this.simulator.updateHerbloreXP();

    if (this.barSelected) {
      this.removeBarhighlight(this.selectedBar);
    }
    this.barSelected = true;
    const barID = this.dungeonBarIDs[this.viewedDungeonID];
    this.selectedBar = barID;
    this.setBarHighlight(barID);

    this.updatePlotData();
    this.plotter.setBarColours(this.simulator.getEnterSet());
    this.updateZoneInfoCard();
    this.plotter.displayGeneral();
  }
  // WIP Stuff for gear sets
  /**
  * @description WIP Function for gear set saving/loading.
  * @param {string} setName
  */
  appendGearSet(setName) {
    this.gearSets.push({
      setName: setName,
      setData: this.gearSelected,
    });
    // Update gear set dropdown

    // Save gear sets to local storage
  }
  /**
         * @description WIP Function for removing a gear set
         * @param {number} setID
         */
  removeGearSet(setID) {
    // Remove set from array

    // Save gear sets to local storage
  }
  /**
   * WIP function to change the currently selected gear to what is saved in a gear set
   * @param {number} setID The index of the gear set
   */
  setGearToSet(setID) {
    // Set Gearselected to data
    this.gearSelected = this.gearSets[setID].setData;
    // Update dropdowns to proper value
    for (let i = 0; i < this.gearSelected.length; i++) {
      for (let j = 0; j < this.gearSubsets[i].length; j++) {
        if (this.gearSubsets[i][j].itemID == this.gearSelected[i]) {
          this.gearLevelCard.dropDowns[i].selectedIndex = j;
          break;
        }
      }
      // Do check for weapon type
      if (i == CONSTANTS.equipmentSlot.Weapon) {
        if (items[gearID].isTwoHanded) {
          this.gearLevelCard.dropDowns[CONSTANTS.equipmentSlot.Shield].selectedIndex = 0;
          this.gearSelected[CONSTANTS.equipmentSlot.Shield] = 0;
          this.gearLevelCard.dropDowns[CONSTANTS.equipmentSlot.Shield].disabled = true;
        } else {
          this.gearLevelCard.dropDowns[CONSTANTS.equipmentSlot.Shield].disabled = false;
        }
        // Change to the correct combat style selector
        if ((items[gearID].type === 'Ranged Weapon') || items[gearID].isRanged) {
          this.disableStyleDropdown('Magic');
          this.disableStyleDropdown('Melee');
          this.enableStyleDropdown('Ranged');
          // Magic
        } else if (items[gearID].isMagic) {
          this.disableStyleDropdown('Ranged');
          this.disableStyleDropdown('Melee');
          this.enableStyleDropdown('Magic');
          // Melee
        } else {
          this.disableStyleDropdown('Magic');
          this.disableStyleDropdown('Ranged');
          this.enableStyleDropdown('Melee');
        }
      }
    }
    // Update gear stats and combat stats
    this.simulator.computeEquipStats();
    this.updateEquipStats();
    this.simulator.computeCombatStats();
    this.updateCombatStats();
  }
  // Data Sanatizing Functions
  /**
   * Removes HTML from the dungeon name
   * @param {number} dungeonID The index of Dungeons
   * @return {string} The name of a dungeon
   */
  getDungeonName(dungeonID) {
    return this.replaceApostrophe(DUNGEONS[dungeonID].name);
  }
  /**
   * Removes HTML from the potion name
   * @param {number} potionID The index of herbloreItemData
   * @return {string} The name of a potion
   */
  getPotionName(potionID) {
    return this.replaceApostrophe(herbloreItemData[potionID].name);
  }
  /**
   * Removes HTML from a prayer name
   * @param {number} prayerID The index of PRAYER
   * @return {string} the name of a prayer
   */
  getPrayerName(prayerID) {
    return this.replaceApostrophe(PRAYER[prayerID].name);
  }
  /**
   * Removes HTML from a spell name
   * @param {number} spellID The index of SPELLS
   * @return {string} The name of a spell
   */
  getSpellName(spellID) {
    return this.replaceApostrophe(SPELLS[spellID].name);
  }
  /**
   * Removes HTML from an item name
   * @param {number} itemID The index of items
   * @return {string} The name of an item
   */
  getItemName(itemID) {
    if (itemID == 0) {
      return 'None';
    } else {
      return this.replaceApostrophe(items[itemID].name);
    }
  }
  /**
   * Removes HTML from a monster name
   * @param {number} monsterID The index of MONSTERS
   * @return {string} the name of a monster
   */
  getMonsterName(monsterID) {
    return this.replaceApostrophe(MONSTERS[monsterID].name);
  }
  /**
   * Replaces &apos; with an actual ' character
   * @param {string} stringToFix The string to replace
   * @return {string} the fixed string
   */
  replaceApostrophe(stringToFix) {
    return stringToFix.replace(/&apos;/g, '\'');
  }
  /** Updates the display post simulation */
  updateDisplayPostSim() {
    this.updatePlotData();
    this.plotter.setBarColours(this.simulator.getEnterSet());
    this.updateZoneInfoCard();
    document.getElementById('MCS Simulate Button').disabled = false;
    document.getElementById('MCS Simulate Button').textContent = 'Simulate';
    document.getElementById('MCS Cancel Button').style.display = 'none';
  }
}
/**
 * A Card Class that creates a bar plot
 */
class McsPlotter {
  /**
   * Consctructs an instance of the plotting class
   * @param {McsApp} parent Reference to container class
   * @param {string} crossedOutURL URL from content script
   */
  constructor(parent, crossedOutURL) {
    this.parent = parent;
    this.barWidth = 20;
    this.barGap = 1;
    this.yAxisWidth = 80;
    this.xAxisHeight = 80;
    this.barNames = [];
    this.barImageSrc = [];
    this.barBottomNames = [];
    this.barBottomLength = [];
    this.barBottomBrackets = [];
    this.plotType = 'xpPerSecond';
    this.plotID = 0;
    this.maskImageFile = crossedOutURL;

    let totBars = 0;

    for (let i = 0; i < combatAreas.length; i++) {
      totBars += combatAreas[i].monsters.length;
      this.barBottomNames.push(combatAreas[i].areaName);
      this.barBottomLength.push(combatAreas[i].monsters.length);
      for (let j = 0; j < combatAreas[i].monsters.length; j++) {
        this.barNames.push(this.parent.getMonsterName(combatAreas[i].monsters[j]));
        this.barImageSrc.push(MONSTERS[combatAreas[i].monsters[j]].media);
      }
    }
    for (let i = 0; i < slayerAreas.length; i++) {
      totBars += slayerAreas[i].monsters.length;
      this.barBottomNames.push(slayerAreas[i].areaName);
      this.barBottomLength.push(slayerAreas[i].monsters.length);
      for (let j = 0; j < slayerAreas[i].monsters.length; j++) {
        this.barNames.push(this.parent.getMonsterName(slayerAreas[i].monsters[j]));
        this.barImageSrc.push(MONSTERS[slayerAreas[i].monsters[j]].media);
      }
    }

    this.barBottomNames.push('Dungeons');
    this.barBottomLength.push(DUNGEONS.length);
    totBars += DUNGEONS.length;
    for (let i = 0; i < DUNGEONS.length; i++) {
      this.barNames.push(this.parent.getDungeonName(i));
      this.barImageSrc.push(DUNGEONS[i].media);
    }

    this.plotContainer = document.createElement('div');
    this.plotContainer.className = 'mcsPlotContainer';
    this.plotContainer.id = 'MCS Plotter';

    this.plotTitle = document.createElement('div');
    this.plotTitle.className = 'mcsPlotTitle';
    this.plotTitle.textContent = 'XP per Second';
    this.plotContainer.appendChild(this.plotTitle);

    this.plotTopContainer = document.createElement('div');
    this.plotTopContainer.className = 'mcsPlotTopContainer';
    this.plotTopContainer.id = 'MCS Plotter Top Container';
    this.plotContainer.appendChild(this.plotTopContainer);

    this.yAxis = document.createElement('div');
    this.yAxis.id = 'MCS Plotter Y-Axis';
    this.yAxis.className = 'mcsYAxis';
    this.yAxis.setAttribute('style', `width: ${this.yAxisWidth}px;`);
    this.plotTopContainer.appendChild(this.yAxis);

    this.plotBox = document.createElement('div');
    this.plotBox.className = 'mcsPlotBox';
    this.plotTopContainer.appendChild(this.plotBox);

    this.xAxis = document.createElement('div');
    this.xAxis.className = 'mcsXAxis';
    this.xAxis.id = 'MCS Plotter X-Axis';
    this.plotContainer.appendChild(this.xAxis);

    // Do Gridlines
    this.gridLine = [];
    for (let i = 0; i < 20; i++) {
      this.gridLine.push(document.createElement('div'));
      this.gridLine[i].className = 'mcsGridline';
      this.gridLine[i].setAttribute('style', `bottom: ${(i + 1) * 5}%;height: 5%;`);
      this.plotBox.appendChild(this.gridLine[i]);
    }

    // Do Bars and images
    this.xAxisImages = [];
    this.xAxisCrosses = [];
    this.xAxisContainers = [];
    this.bars = [];
    for (let i = 0; i < totBars; i++) {
      this.bars.push(document.createElement('div'));
      this.bars[i].className = 'mcsBar';
      this.bars[i].style.height = 0;
      this.bars[i].setAttribute('data-barid', i);
      this.plotBox.appendChild(this.bars[i]);

      const imageContainer = document.createElement('div');
      imageContainer.className = 'mcsXAxisImageContainer';
      imageContainer.onclick = () => this.parent.barImageOnClick(i);
      this.xAxisContainers.push(imageContainer);

      this.xAxisImages.push(document.createElement('img'));
      this.xAxisImages[i].className = 'mcsXAxisImage';
      this.xAxisImages[i].src = this.barImageSrc[i];

      const newCross = document.createElement('img');
      newCross.src = this.maskImageFile;
      newCross.className = 'mcsCross';
      newCross.style.display = 'none';
      this.xAxisCrosses.push(newCross);

      imageContainer.appendChild(this.xAxisImages[i]);
      imageContainer.appendChild(newCross);
      this.xAxis.appendChild(imageContainer);
    }
    // Do Second descriptions
    let botLength = 0;
    this.barBottomDivs = [];
    let divi = 0;
    for (let i = this.barBottomNames.length - 1; i > -1; i--) {
      this.barBottomDivs.push(document.createElement('div'));
      this.barBottomDivs[divi].appendChild(document.createTextNode(this.barBottomNames[i]));
      this.barBottomDivs[divi].className = 'mcsPlotLabel';
      this.barBottomDivs[divi].style.right = `${100 * botLength / totBars + 50 * this.barBottomLength[i] / totBars}%`;
      this.xAxis.appendChild(this.barBottomDivs[divi]);
      const newSect = document.createElement('div');
      newSect.className = 'mcsXAxisSection';
      newSect.style.width = `${100 * this.barBottomLength[i] / totBars}%`;
      newSect.style.right = `${100 * botLength / totBars}%`;
      if (i == 0) {
        newSect.style.borderLeftStyle = 'solid';
      }
      this.barBottomBrackets.push(newSect);
      this.xAxis.appendChild(newSect);
      botLength += this.barBottomLength[i];
      divi++;
    }
    // Do Leave Inspection button
    this.stopInspectButton = document.createElement('button');
    this.stopInspectButton.className = 'mcsButton';
    this.stopInspectButton.textContent = 'Stop Inspecting';
    this.stopInspectButton.style.position = 'absolute';
    this.stopInspectButton.style.bottom = '5px';
    this.stopInspectButton.style.right = '5px';
    this.stopInspectButton.style.whiteSpace = 'nowrap';
    this.stopInspectButton.style.display = 'none';
    this.stopInspectButton.onclick = () => {
      this.parent.stopInspectOnClick();
    };
    this.xAxis.appendChild(this.stopInspectButton);
    // Add toggle buttons
    this.toggleMonsterButton = document.createElement('button');
    this.toggleMonsterButton.className = 'mcsButton';
    this.toggleMonsterButton.textContent = 'Toggle Monsters';
    this.toggleMonsterButton.style.position = 'absolute';
    this.toggleMonsterButton.style.top = '0';
    this.toggleMonsterButton.style.width = '150px';
    this.toggleMonsterButton.style.left = '85px';
    this.toggleMonsterButton.style.whiteSpace = 'nowrap';
    this.toggleMonsterButton.onclick = () => {
      this.parent.toggleMonsterSims(false);
    };
    this.plotContainer.appendChild(this.toggleMonsterButton);
    this.toggleDungeonButton = document.createElement('button');
    this.toggleDungeonButton.className = 'mcsButton';
    this.toggleDungeonButton.textContent = 'Toggle Dungeons';
    this.toggleDungeonButton.style.position = 'absolute';
    this.toggleDungeonButton.style.top = '0';
    this.toggleDungeonButton.style.width = '150px';
    this.toggleDungeonButton.style.left = '240px';
    this.toggleDungeonButton.style.whiteSpace = 'nowrap';
    this.toggleDungeonButton.onclick = () => {
      this.parent.toggleDungeonSims(false);
    };
    this.plotContainer.appendChild(this.toggleDungeonButton);
    // Do tickmarks
    this.tickMarks = [];
    for (let i = 0; i < 20; i++) {
      this.tickMarks.push(document.createElement('div'));
      this.tickMarks[i].className = 'mcsTickmark';
      this.tickMarks[i].style.height = '5%';
      this.tickMarks[i].style.bottom = `${(i + 1) * 5}%`;
      this.plotBox.appendChild(this.tickMarks[i]);
    }
    // Do ticktext
    this.tickText = [];
    for (let i = 0; i < 21; i++) {
      this.tickText.push(document.createElement('div'));
      this.tickText[i].className = 'mcsTicktext';
      this.tickText[i].setAttribute('style', `height: 5%; bottom: ${i * 5 - 2.5}%;`);
      this.tickText[i].appendChild(document.createTextNode(mcsFormatNum(i * 0.05, 4)));
      this.yAxis.appendChild(this.tickText[i]);
    }
    // Do Tooltips
    this.barTooltips = [];
    for (let i = 0; i < this.bars.length; i++) {
      this.barTooltips.push(document.createElement('div'));
      this.barTooltips[i].className = 'mcsBarTooltip';
      this.barTooltips[i].style.display = 'none';
      if (i < (this.bars.length - 3)) {
        this.barTooltips[i].style.left = `0%`;
      } else {
        this.barTooltips[i].style.right = `0%`;
      }
      this.bars[i].appendChild(this.barTooltips[i]);
      this.bars[i].onmouseover = (event) => this.barOnMouseOver(event, i);
      this.bars[i].onmouseout = (event) => this.barOnMouseOut(event, i);
    }

    this.parent.topContent.appendChild(this.plotContainer);
    // Data for displaying dungeons
    this.dungeonDisplayData = [];
    // Condensed monster data for dungeon display
    DUNGEONS.forEach((dungeon) => {
      let lastMonster = -1;
      const displayData = [];
      dungeon.monsters.forEach((monster) => {
        if (monster != lastMonster) {
          lastMonster = monster;
          displayData.push({
            monsterID: lastMonster,
            imageSource: MONSTERS[lastMonster].media,
            name: this.parent.getMonsterName(lastMonster),
          });
        }
      });
      this.dungeonDisplayData.push(displayData);
    });
  }
  /**
   * Toggles the display of a bar tooltip on
   * @param {MouseEvent} event The mouse event
   * @param {number} id The ID of the bar
   */
  barOnMouseOver(event, id) {
    this.barTooltips[id].style.display = 'block';
  }
  /**
   * Toggles the display of a bar tooltip off
   * @param {MouseEvent} event The mouse event
   * @param {number} id The ID of the bar
   */
  barOnMouseOut(event, id) {
    this.barTooltips[id].style.display = 'none';
  }
  /**
   * Changes the displayed data
   * @param {Array<number>} barData The new data to diplay
   */
  updateBarData(barData) {
    let barMax = barData[0];
    for (let i = 1; i < barData.length; i++) {
      if (barData[i] > barMax) {
        barMax = barData[i];
      }
    }
    let division;
    let Ndivs;
    let divMax;
    if (barMax != 0) {
      const divRatio = barMax / Math.pow(10, Math.floor(Math.log10(barMax)) + 1);
      let closestRatio;
      if (divRatio >= 0.5) {
        closestRatio = 0.5;
      } else if (divRatio >= 0.25) {
        closestRatio = 0.25;
      } else if (divRatio >= 0.2) {
        closestRatio = 0.2;
      } else if (divRatio >= 0.1) {
        closestRatio = 0.1;
      }
      division = closestRatio * Math.pow(10, Math.floor(Math.log10(barMax)));
      Ndivs = Math.ceil(barMax / division);
      divMax = Ndivs * division;
    } else {
      divMax = 1;
      Ndivs = 10;
      division = 0.1;
    }
    // Modify in reverse
    const numBars = this.bars.length;
    const numData = barData.length;
    for (let i = 0; i < numData; i++) {
      const dataIndex = numData - i - 1;
      const barIndex = numBars - i - 1;
      this.bars[barIndex].style.height = `${barData[dataIndex] / divMax * 100}%`;
      this.barTooltips[barIndex].textContent = mcsFormatNum(barData[dataIndex], 4);
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
        this.tickText[i].textContent = mcsFormatNum(i * division, 4);
      } else {
        this.tickText[i].style.display = 'none';
      }
    }
  }
  /**
   * Changes the colour of bars to red if the user cannot enter that area
   * @param {Array<boolean>} enterSet The array of areas that can be enetered
   */
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
  /**
   * Changes the plot display to non-dungeon monsters and dungeon summary
   */
  displayGeneral() {
    for (let i = 0, numBars = this.bars.length; i < numBars; i++) {
      // Change image source
      this.xAxisContainers[i].style.display = '';
      this.xAxisImages[i].setAttribute('src', this.barImageSrc[i]);
      this.bars[i].style.display = '';
    }
    this.showZoneLabels();
    this.crossImagesPerSetting();
    this.stopInspectButton.style.display = 'none';
    this.toggleDungeonButton.style.display = '';
    this.toggleMonsterButton.style.display = '';
  }
  /**
   * Changes the plot display to individual dungeon monsters
   * @param {number} dungeonID The index of DUNGEONS
   */
  displayDungeon(dungeonID) {
    // Loop through each bar and enable/disable as required
    const uniqueMonsterCount = this.dungeonDisplayData[dungeonID].length;
    // Change Images at bottom
    // Toggle Zone Labels
    // Toggle display of bars
    // Remove the white border stuff
    for (let i = 0, numBars = this.bars.length; i < numBars; i++) {
      if (i < uniqueMonsterCount) {
        // Change image source
        this.xAxisContainers[i].style.display = '';
        this.xAxisImages[i].setAttribute('src', this.dungeonDisplayData[dungeonID][i].imageSource);
        this.bars[numBars - i - 1].style.display = '';
      } else {
        // Disable Bar and images
        this.xAxisContainers[i].style.display = 'none';
        this.bars[numBars - i - 1].style.display = 'none';
      }
    }
    this.hideZoneLabels();
    this.unCrossAllImages();
    this.stopInspectButton.style.display = '';
    this.toggleDungeonButton.style.display = 'none';
    this.toggleMonsterButton.style.display = 'none';
  }
  /**
   * Turns the crossout overlay on for a monster/dungeon image
   * @param {number} imageID the index of the cross
   */
  crossOutBarImage(imageID) {
    this.xAxisCrosses[imageID].style.display = '';
  }
  /**
   * Turns the crossout overlay off for a monster/dungeon image
   * @param {number} imageID The index of the cross
   */
  unCrossOutBarImage(imageID) {
    this.xAxisCrosses[imageID].style.display = 'none';
  }
  /**
   * Toggles the display of the area/dungeon labels off
   */
  hideZoneLabels() {
    this.barBottomDivs.forEach((bottomDiv) => {
      bottomDiv.style.display = 'none';
    });
    this.barBottomBrackets.forEach((bracket) => {
      bracket.style.display = 'none';
    });
  }
  /**
   * Toggles the display of the area/dungeon labels on
   */
  showZoneLabels() {
    this.barBottomDivs.forEach((bottomDiv) => {
      bottomDiv.style.display = '';
    });
    this.barBottomBrackets.forEach((bracket) => {
      bracket.style.display = '';
    });
  }
  /**
   * Toggles the crossout overlay off for all images
   */
  unCrossAllImages() {
    this.xAxisCrosses.forEach((cross) => {
      cross.style.display = 'none';
    });
  }
  /**
   * Toggles the crossout overlay on/off depending on whether it is simulated or not
   */
  crossImagesPerSetting() {
    for (let i = 0; i < this.parent.barIsDungeon.length; i++) {
      if (this.parent.barIsDungeon[i] && !this.parent.simulator.dungeonSimFilter[this.parent.barMonsterIDs[i]]) {
        this.xAxisCrosses[i].style.display = '';
      } else if (!this.parent.barIsDungeon[i] && !this.parent.simulator.monsterSimFilter[this.parent.barMonsterIDs[i]]) {
        this.xAxisCrosses[i].style.display = '';
      } else {
        this.xAxisCrosses[i].style.display = 'none';
      }
    }
  }
}

// Type definitions for McsSimulator properties that are dynamically generated based on game data
/**
 * Simulation result for a single monster
 * @typedef {Object} monsterSimResult
 * @property {boolean} inQueue
 * @property {boolean} simSuccess
 * @property {number} xpPerEnemy
 * @property {number} xpPerSecond
 * @property {number} xpPerHit
 * @property {number} hpxpPerEnemy
 * @property {number} hpPerEnemy
 * @property {number} hpPerSecond
 * @property {number} dmgPerSecond
 * @property {number} avgKillTime
 * @property {number} attacksMade
 * @property {number} avgHitDmg
 * @property {number} killTimeS
 * @property {number} gpPerKill
 * @property {number} gpPerSecond
 * @property {number} prayerXpPerEnemy
 * @property {number} prayerXpPerSecond
 * @property {number} slayerXpPerSecond
 * @property {number} ppConsumedPerSecond
 * @property {number} herbloreXPPerSecond
 * @property {number} signetChance
 * @property {number} gpFromDamage
 * @property {number} attacksTaken
 * @property {number} attacksTakenPerSecond
 * @property {number} attacksMadePerSecond
 * @property {number} simulationTime
 */
/**
 * Stats of the player
 * @typedef {Object} playerStats
 * @property {number} attackSpeed Attack speed in ms
 * @property {number} attackType Attack Type Melee:0, Ranged:1, Magic:2
 * @property {number} maxAttackRoll Accuracy Rating
 * @property {number} maxHit Maximum Hit of Normal Attack
 * @property {number} maxDefRoll Melee Evasion Rating
 * @property {number} maxMagDefRoll Magic Evasion Rating
 * @property {number} maxRngDefRoll Ranged Evasion Rating
 * @property {number} xpBonus Fractional bonus to combat xp gain
 * @property {number} avgHPRegen Average HP gained per regen interval
 * @property {number} damageReduction Damage Reduction in %
 * @property {boolean} diamondLuck If player has diamond luck potion active
 * @property {boolean} hasSpecialAttack If player can special attack
 * @property {Object} specialData Data of player special attack
 * @property {number} startingGP Initial GP of player
 * @property {Object} levels Levels of player
 * @property {boolean[]} prayerSelected Prayers of PRAYER that player has active
 * @property {number} activeItems Special items the player has active
 * @property {number} prayerPointsPerAttack Prayer points consumed per player attack
 * @property {number} prayerPointsPerEnemy Prayer points consumed per enemy attack
 * @property {number} prayerPointsPerHeal Prayer points consumed per regen interval
 * @property {number} prayerXPperDamage Prayer xp gained per point of damage dealt
 * @property {boolean} isProtected Player has active protection prayer
 */
/**
 * Simulator class, used for all simulation work, and storing simulation results and settings
 * @property {Array} monsterSimData
 */
class McsSimulator {
  /**
   *
   * @param {McsApp} parent Reference to container class
   * @param {string} workerURL URL to simulator web worker
   */
  constructor(parent, workerURL) {
    this.parent = parent;
    // Player combat stats
    this.playerLevels = {
      Attack: 1,
      Strength: 1,
      Defence: 1,
      Hitpoints: 10,
      Ranged: 1,
      Magic: 1,
      Prayer: 1,
      Slayer: 1,
    };
    // Equipment Stats
    this.equipStats = {
      attackSpeed: 4000,
      strengthBonus: 0,
      attackBonus: [0, 0, 0],
      rangedAttackBonus: 0,
      rangedStrengthBonus: 0,
      magicAttackBonus: 0,
      magicDamageBonus: 0,
      defenceBonus: 0,
      damageReduction: 0,
      rangedDefenceBonus: 0,
      magicDefenceBonus: 0,
      attackLevelRequired: 1,
      defenceLevelRequired: 1,
      rangedLevelRequired: 1,
      magicLevelRequired: 1,
      slayerXPBonus: 0,
      chanceToDoubleLoot: 0,
    };
    // Spell Selection
    this.selectedSpell = 0;
    this.spells = {
      standard: {
        array: SPELLS,
        isSelected: true,
        selectedID: 0,
      },
      curse: {
        array: CURSES,
        isSelected: false,
        selectedID: -1,
      },
      aurora: {
        array: AURORAS,
        isSelected: false,
        selectedID: -1,
      },
      ancient: {
        array: ANCIENT,
        isSelected: false,
        selectedID: -1,
      },
    };
    // Pet Selection
    this.petOwned = [false, false, false, false, false, false, false, false, false];
    // Style Selection
    this.attackStyle = {
      Melee: 0,
      Ranged: 0,
      Magic: 0,
    };
    // Combat Stats
    this.combatStats = {
      attackSpeed: 4000,
      maxHit: 0,
      maxAttackRoll: 0,
      maxDefRoll: 0,
      maxRngDefRoll: 0,
      maxMagDefRoll: 0,
      damageReduction: 0,
      attackType: 0,
    };
    // Prayer Stats
    /** @type {Array<boolean>} */
    this.prayerSelected = [];
    for (let i = 0; i < PRAYER.length; i++) {
      this.prayerSelected.push(false);
    }
    this.prayerKeyMap = {
      prayerBonusAttack: 'meleeAccuracy',
      prayerBonusStrength: 'meleeDamage',
      prayerBonusDefence: 'meleeEvasion',
      prayerBonusAttackRanged: 'rangedAccuracy',
      prayerBonusStrengthRanged: 'rangedDamage',
      prayerBonusDefenceRanged: 'rangedEvasion',
      prayerBonusAttackMagic: 'magicAccuracy',
      prayerBonusDamageMagic: 'magicDamage',
      prayerBonusDefenceMagic: 'magicEvasion',
      prayerBonusProtectItem: 'protectItem',
      prayerBonusHitpoints: 'hitpoints',
      prayerBonusProtectFromMelee: 'protectFromMelee',
      prayerBonusProtectFromRanged: 'protectFromRanged',
      prayerBonusProtectFromMagic: 'protectFromMagic',
      prayerBonusHitpointHeal: 'hitpointHeal',
      prayerBonusDamageReduction: 'damageReduction',
    };
    this.activePrayers = 0;
    /** Computer Prayer Bonus From UI */
    this.prayerBonus = {
      meleeAccuracy: 0,
      meleeDamage: 0,
      meleeEvasion: 0,
      rangedAccuracy: 0,
      rangedDamage: 0,
      rangedEvasion: 0,
      magicAccuracy: 0,
      magicDamage: 0,
      magicEvasion: 0,
      protectItem: 0,
      hitpoints: 1,
      protectFromMelee: 0,
      protectFromRanged: 0,
      protectFromMagic: 0,
      hitpointHeal: 0,
      damageReduction: 0,
    };
    // Slayer Variables
    this.isSlayerTask = false;
    // Hardcore
    this.isHardcore = false;
    // Herblore Bonuses
    this.potionSelected = false;
    this.potionTier = 0;
    this.potionID = -1;
    this.herbloreBonus = {
      damageReduction: 0, // 8
      rangedAccuracy: 0, // 3
      rangedStrength: 0, // 4
      magicAccuracy: 0, // 5
      magicDamage: 0, // 6
      meleeAccuracy: 0, // 0
      meleeStrength: 0, // 2
      meleeEvasion: 0, // 1
      rangedEvasion: 0, // 3
      magicEvasion: 0, // 5
      hpRegen: 0, // 7
      diamondLuck: false, // 9
      divine: 0, // 10
      luckyHerb: 0, // 11
    };

    /** Herblore XP for Lucky Herb Potions */
    this.xpPerHerb = {
      527: 10, // Garum
      528: 14, // Sourweed
      529: 33, // Mantalyme
      530: 41, // Lemontyle
      531: 53, // Oxilyme
      532: 85, // Poraxx
      533: 112, // Pigtayle
      534: 160, // Barrentoe
    };
    /** Array of spell IDs that trigger Cloudburst */
    this.waterSpells = [1, 5, 9, 13, 17];
    // Simulation settings
    /** Max number of player hits to attempt before timeout */
    this.Nhitmax = 1000;
    /** Number of enemy kills to simulate */
    this.Ntrials = 10000;
    /** Number of hours to farm for signet ring */
    this.signetFarmTime = 1;
    /** @type {Array<boolean>} */
    this.monsterSimFilter = [];
    /** @type {Array<boolean>} */
    this.dungeonSimFilter = [];
    // Simulation data;
    /** @type {Array<monsterSimResult>} */
    this.monsterSimData = [];
    for (let i = 0; i < MONSTERS.length; i++) {
      this.monsterSimData.push({
        inQueue: false,
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
        attacksMade: 0,
        avgHitDmg: 0,
        killTimeS: 0,
        gpPerKill: 0,
        gpPerSecond: 0,
        prayerXpPerEnemy: 0,
        prayerXpPerSecond: 0,
        slayerXpPerSecond: 0,
        ppConsumedPerSecond: 0,
        herbloreXPPerSecond: 0,
        signetChance: 0,
        gpFromDamage: 0,
        attacksTaken: 0,
        attacksTakenPerSecond: 0,
        attacksMadePerSecond: 0,
        simulationTime: 0,
      });
      this.monsterSimFilter.push(true);
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
        attacksMade: 0,
        avgHitDmg: 0,
        killTimeS: 0,
        gpPerKill: 0,
        gpPerSecond: 0,
        prayerXpPerSecond: 0,
        slayerXpPerSecond: 0,
        ppConsumedPerSecond: 0,
        herbloreXPPerSecond: 0,
        signetChance: 0,
        gpFromDamage: 0,
        attacksTaken: 0,
        attacksTakenPerSecond: 0,
        attacksMadePerSecond: 0,
        simulationTime: 0,
      });
      this.dungeonSimFilter.push(true);
    }
    // Pre Compute Monster Base Stats
    /** @typedef {Object} enemyStats
     * @property {number} hitpoints Max Enemy HP
     * @property {number} attackSpeed Enemy attack speed (ms)
     * @property {number} attackType Enemy attack type
     * @property {number} maxHit Normal attack max hit
     * @property {number} maxDefRoll Melee Evasion Rating
     * @property {number} maxMagDefRoll Magic Evasion Rating
     * @property {number} maxRngDefRoll Ranged Evasion Rating
     * @property {boolean} hasSpecialAttack If enemy can do special attacks
     * @property {Array<number>} specialAttackChances Chance of each special attack
     * @property {Array<number>} specialIDs IDs of special attacks
     * @property {number} specialLength Number of special attacks
     */
    /** @type {Array<enemyStats>} */
    this.enemyStats = [];
    for (let i = 0; i < MONSTERS.length; i++) {
      this.enemyStats.push(this.getEnemyStats(i));
    }
    /** Variables of currently stored simulation */
    this.currentSim = {
      gpBonus: 1,
      lootBonus: 1,
      slayerXPBonus: 0,
      canTopazDrop: false,
      herbConvertChance: 0,
      doBonesAutoBury: false,
      playerStats: {},
      equipStats: {},
      options: {},
      prayerBonus: {},
      herbloreBonus: {},
      combatStats: {},
      attackStyle: {},
      isSlayerTask: false,
    };
    // Options for GP/s calculations
    this.sellBones = false; // True or false
    this.sellLoot = 'All'; // Options 'All','Subset','None'
    this.saleList = this.getSaleList();
    this.lootList = this.getLootList(); // List of items with id: X and sell: true/false
    this.defaultSaleKeep = [403, 247, 248, 366, 249, 383, 368, 246, 367, 348, 443, 350, 349, 351, 347, 430, 429, 427, 428, 137, 136, 139, 314, 313, 312, 134, 296, 138, 141, 140, 434, 142, 135, 426, 425, 423, 424, 418, 417, 415, 416, 340, 405, 344, 406, 361, 414, 413, 411, 412, 372, 378, 371, 374, 369, 373, 380, 376, 375, 377, 379, 370, 407, 341, 365, 364, 422, 421, 419, 420, 120, 404];
    this.convertShards = false;
    this.setSaleListToDefault();
    // Options for time multiplier
    this.timeMultiplier = 1;
    this.selectedPlotIsTime = true;
    // Condensed monster data for dungeon display
    /** @typedef {Object} dungeonMonster
     * @property {number} id
     * @property {number} quantity
     * @property {boolean} isBoss
     */
    /** @type {Array<Array<dungeonMonster>>} */
    this.condensedDungeonMonsters = [];
    DUNGEONS.forEach((dungeon) => {
      let lastMonster = -1;
      let currentIndex = -1;
      const condensedArray = [];
      dungeon.monsters.forEach((monster) => {
        if (monster == lastMonster) {
          condensedArray[currentIndex].quantity++;
        } else {
          lastMonster = monster;
          currentIndex++;
          condensedArray.push({
            id: lastMonster,
            quantity: 1,
            isBoss: false,
          });
        }
      });
      condensedArray[condensedArray.length - 1].isBoss = true;
      this.condensedDungeonMonsters.push(condensedArray);
    });
    // Data Export Settings
    this.exportDataType = [];
    this.exportName = true;
    this.exportDungeonMonsters = true;
    this.exportNonSimmed = true;
    for (let i = 0; i < this.parent.plotTypeDropdownValues.length; i++) {
      this.exportDataType.push(true);
    }
    // Test Settings
    this.isTestMode = false;
    this.testMax = 10;
    this.testCount = 0;
    // Simulation queue and webworkers
    this.workerURL = workerURL;
    this.currentJob = 0;
    this.simInProgress = false;
    /** @typedef {Object} simulationJob
     * @property {number} monsterID
     */
    /** @type {Array<simulationJob>} */
    this.simulationQueue = [];
    /** @typedef {Object} simulationWorker
     * @property {Worker} worker
     * @property {boolean} inUse
    */
    /** @type {Array<simulationWorker>} */
    this.simulationWorkers = [];
    this.maxThreads = window.navigator.hardwareConcurrency;
    this.simStartTime = 0;
    /** If the current sim has been cancelled */
    this.simCancelled = false;
    // Create Web workers
    this.createWorkers();
  }

  /**
   * Initializes a performance test
   * @param {number} numSims number of simulations to run in a row
   * @memberof McsSimulator
   */
  runTest(numSims) {
    this.testCount = 0;
    this.isTestMode = true;
    this.testMax = numSims;
    this.simulateCombat();
  }

  /**
   * Creates the webworkers for simulation jobs
   */
  async createWorkers() {
    for (let i = 0; i < this.maxThreads; i++) {
      const worker = await this.createWorker();
      this.intializeWorker(worker, i);
      const newWorker = {
        worker: worker,
        inUse: false,
        selfTime: 0,
      };
      this.simulationWorkers.push(newWorker);
    }
  }

  /**
   * Attempts to create a web worker, if it fails uses a chrome hack to get a URL that works
   * @return {Promise<Worker>}
   */
  createWorker() {
    return new Promise((resolve, reject) => {
      let newWorker;
      try {
        newWorker = new Worker(this.workerURL);
        resolve(newWorker);
      } catch (error) {
        // Chrome Hack
        if (error.name === 'SecurityError' && error.message.includes('Failed to construct \'Worker\': Script')) {
          const workerContent = new XMLHttpRequest();
          workerContent.open('GET', this.workerURL);
          workerContent.send();
          workerContent.addEventListener('load', (event)=>{
            const blob = new Blob([event.currentTarget.responseText], {type: 'application/javascript'});
            this.workerURL = URL.createObjectURL(blob);
            resolve(new Worker(this.workerURL));
          });
        } else { // Other Error
          reject(error);
        }
      }
    });
  }
  /**
   * Intializes a simulation worker
   * @param {Worker} worker
   * @param {number} i
   */
  intializeWorker(worker, i) {
    worker.onmessage = (event) => this.processWorkerMessage(event, i);
    worker.onerror = (event) => {
      console.log('An error occured in a simulation worker');
      console.log(event);
    };
    worker.postMessage({action: 'RECIEVE_GAMEDATA',
      protectFromValue: protectFromValue,
      numberMultiplier: numberMultiplier,
      enemySpecialAttacks: enemySpecialAttacks,
      enemySpawnTimer: enemySpawnTimer,
      hitpointRegenInterval: hitpointRegenInterval,
      Deadeye_Amulet: items[CONSTANTS.item.Deadeye_Amulet],
      Confetti_Crossbow: items[CONSTANTS.item.Confetti_Crossbow],
      Warlock_Amulet: items[CONSTANTS.item.Warlock_Amulet],
    });
  }
  /**
  * @description Computes the stats of the players equipped items and stores them on this properties
  */
  computeEquipStats() {
    this.resetGearStats();
    for (let i = 0; i < this.parent.slotKeys.length; i++) {
      const itemID = this.parent.gearSelected[i];
      let curItem;
      if (itemID == 0) {
        continue;
      } else {
        curItem = items[itemID];
      }
      this.equipStats.strengthBonus += (curItem.strengthBonus) ? curItem.strengthBonus : 0;
      if (curItem.attackBonus != undefined) {
        for (let j = 0; j < 3; j++) {
          this.equipStats.attackBonus[j] += curItem.attackBonus[j];
        }
      }
      if (!(i == CONSTANTS.equipmentSlot.Weapon && curItem.isAmmo)) {
        this.equipStats.rangedAttackBonus += (curItem.rangedAttackBonus) ? curItem.rangedAttackBonus : 0;
        this.equipStats.rangedStrengthBonus += (curItem.rangedStrengthBonus) ? curItem.rangedStrengthBonus : 0;
        this.equipStats.rangedDefenceBonus += (curItem.rangedDefenceBonus) ? curItem.rangedDefenceBonus : 0;
      }
      this.equipStats.magicAttackBonus += (curItem.magicAttackBonus) ? curItem.magicAttackBonus : 0;
      this.equipStats.magicDamageBonus += (curItem.magicDamageBonus) ? curItem.magicDamageBonus : 0;
      this.equipStats.defenceBonus += (curItem.defenceBonus) ? curItem.defenceBonus : 0;
      this.equipStats.damageReduction += (curItem.damageReduction) ? curItem.damageReduction : 0;
      this.equipStats.magicDefenceBonus += (curItem.magicDefenceBonus) ? curItem.magicDefenceBonus : 0;
      this.equipStats.slayerXPBonus += (curItem.slayerBonusXP) ? curItem.slayerBonusXP : 0;
      this.equipStats.chanceToDoubleLoot += (curItem.chanceToDoubleLoot) ? curItem.chanceToDoubleLoot : 0;

      if (((curItem.attackLevelRequired) ? curItem.attackLevelRequired : 1) > this.equipStats.attackLevelRequired) {
        this.equipStats.attackLevelRequired = curItem.attackLevelRequired;
      }
      if (((curItem.rangedLevelRequired) ? curItem.rangedLevelRequired : 1) > this.equipStats.rangedLevelRequired) {
        this.equipStats.rangedLevelRequired = curItem.rangedLevelRequired;
      }
      if (((curItem.magicLevelRequired) ? curItem.magicLevelRequired : 1) > this.equipStats.magicLevelRequired) {
        this.equipStats.magicLevelRequired = curItem.magicLevelRequired;
      }
      if (((curItem.defenceLevelRequired) ? curItem.defenceLevelRequired : 1) > this.equipStats.defenceLevelRequired) {
        this.equipStats.defenceLevelRequired = curItem.defenceLevelRequired;
      }
      if (i == CONSTANTS.equipmentSlot.Weapon) {
        this.equipStats.attackSpeed = (curItem.attackSpeed) ? curItem.attackSpeed : 4000;
      }
    }
  }
  /**
  * @description Computes the combat stats from Equipment stats, combat style, spell selection and player levels and stores them on this properties
  */
  computeCombatStats() {
    // ['Attack','Strength','Defence','Ranged','Magic']
    this.combatStats.attackSpeed = 4000;
    let attackStyleBonus = 1;
    let meleeDefenceBonus = 1;
    const weaponID = this.parent.gearSelected[CONSTANTS.equipmentSlot.Weapon];
    // Ranged
    if ((items[weaponID].type === 'Ranged Weapon') || items[weaponID].isRanged) {
      this.combatStats.attackType = 1;
      if (this.attackStyle.Ranged == 0) {
        attackStyleBonus += 3;
        this.combatStats.attackSpeed = this.equipStats.attackSpeed;
      } else if (this.attackStyle.Ranged == 1) {
        this.combatStats.attackSpeed = this.equipStats.attackSpeed - 400;
      } else {
        meleeDefenceBonus += 3;
        this.combatStats.attackSpeed = this.equipStats.attackSpeed;
      }
      const effectiveAttackLevel = Math.floor(this.playerLevels.Ranged + 8 + attackStyleBonus);
      this.combatStats.maxAttackRoll = Math.floor(effectiveAttackLevel * (this.equipStats.rangedAttackBonus + 64) * (1 + (this.prayerBonus.rangedAccuracy / 100)) * (1 + this.herbloreBonus.rangedAccuracy / 100));

      const effectiveStrengthLevel = Math.floor(this.playerLevels.Ranged + attackStyleBonus);
      this.combatStats.maxHit = Math.floor(numberMultiplier * ((1.3 + effectiveStrengthLevel / 10 + this.equipStats.rangedStrengthBonus / 80 + effectiveStrengthLevel * this.equipStats.rangedStrengthBonus / 640) * (1 + (this.prayerBonus.rangedDamage / 100)) * (1 + this.herbloreBonus.rangedStrength / 100)));
      // Magic
    } else if (items[weaponID].isMagic) {
      this.combatStats.attackType = 2;
      effectiveAttackLevel = Math.floor(this.playerLevels.Magic + 8 + attackStyleBonus);
      this.combatStats.maxAttackRoll = Math.floor(effectiveAttackLevel * (this.equipStats.magicAttackBonus + 64) * (1 + (this.prayerBonus.magicAccuracy / 100)) * (1 + this.herbloreBonus.magicAccuracy / 100));
      this.combatStats.maxHit = Math.floor(numberMultiplier * ((SPELLS[this.selectedSpell].maxHit + SPELLS[this.selectedSpell].maxHit * (this.equipStats.magicDamageBonus / 100)) * (1 + (this.playerLevels.Magic + 1) / 200) * (1 + this.prayerBonus.magicDamage / 100) * (1 + this.herbloreBonus.magicDamage / 100)));
      // Cloudburst Water Spell Bonus
      if (this.parent.gearSelected[CONSTANTS.equipmentSlot.Weapon] == CONSTANTS.item.Cloudburst_Staff && (this.waterSpells.includes(this.selectedSpell))) {
        this.combatStats.maxHit += items[CONSTANTS.item.Cloudburst_Staff].increasedWaterSpellDamage * numberMultiplier;
      }
      this.combatStats.attackSpeed = this.equipStats.attackSpeed;
      // Melee
    } else {
      this.combatStats.attackType = 0;
      effectiveAttackLevel = Math.floor(this.playerLevels.Attack + 8 + attackStyleBonus);
      this.combatStats.maxAttackRoll = Math.floor(effectiveAttackLevel * (this.equipStats.attackBonus[this.attackStyle.Melee] + 64) * (1 + (this.prayerBonus.meleeAccuracy / 100)) * (1 + this.herbloreBonus.meleeAccuracy / 100));

      effectiveStrengthLevel = Math.floor(this.playerLevels.Strength + 8 + 1);
      this.combatStats.maxHit = Math.floor(numberMultiplier * ((1.3 + effectiveStrengthLevel / 10 + this.equipStats.strengthBonus / 80 + effectiveStrengthLevel * this.equipStats.strengthBonus / 640) * (1 + (this.prayerBonus.meleeDamage / 100)) * (1 + this.herbloreBonus.meleeStrength / 100)));
      this.combatStats.attackSpeed = this.equipStats.attackSpeed;
    }
    const effectiveDefenceLevel = Math.floor(this.playerLevels.Defence + 8 + meleeDefenceBonus);
    this.combatStats.maxDefRoll = Math.floor(effectiveDefenceLevel * (this.equipStats.defenceBonus + 64) * (1 + (this.prayerBonus.meleeEvasion) / 100) * (1 + this.herbloreBonus.meleeEvasion / 100));
    const effectiveRngDefenceLevel = Math.floor(this.playerLevels.Defence + 8 + 1);
    this.combatStats.maxRngDefRoll = Math.floor(effectiveRngDefenceLevel * (this.equipStats.rangedDefenceBonus + 64) * (1 + (this.prayerBonus.rangedEvasion) / 100) * (1 + this.herbloreBonus.rangedEvasion / 100));
    // This might be changed because it is currently a bug
    const effectiveMagicDefenceLevel = Math.floor(this.playerLevels.Magic * 0.7 + this.playerLevels.Defence * 0.3 + 9);
    this.combatStats.maxMagDefRoll = Math.floor(effectiveMagicDefenceLevel * (this.equipStats.magicDefenceBonus + 64) * (1 + (this.prayerBonus.magicEvasion / 100)) * (1 + this.herbloreBonus.magicEvasion / 100));
    this.combatStats.damageReduction = this.equipStats.damageReduction + this.herbloreBonus.damageReduction + this.prayerBonus.damageReduction;
  }
  /**
  * @description Computes the prayer bonuses for the selected prayers
  */
  computePrayerBonus() {
    this.resetPrayerBonus();
    for (let i = 0; i < this.prayerSelected.length; i++) {
      if (this.prayerSelected[i]) {
        for (let j = 0; j < PRAYER[i].vars.length; j++) {
          this.prayerBonus[this.prayerKeyMap[PRAYER[i].vars[j]]] += PRAYER[i].values[j];
        }
      }
    }
  }
  /**
   * Resets prayer bonuses to none
   */
  resetPrayerBonus() {
    this.prayerBonus.meleeAccuracy = 0;
    this.prayerBonus.meleeDamage = 0;
    this.prayerBonus.meleeEvasion = 0;
    this.prayerBonus.rangedAccuracy = 0;
    this.prayerBonus.rangedDamage = 0;
    this.prayerBonus.rangedEvasion = 0;
    this.prayerBonus.magicAccuracy = 0;
    this.prayerBonus.magicDamage = 0;
    this.prayerBonus.magicEvasion = 0;
    this.prayerBonus.protectItem = 0;
    this.prayerBonus.hitpoints = 1;
    this.prayerBonus.protectFromMelee = 0;
    this.prayerBonus.protectFromRanged = 0;
    this.prayerBonus.protectFromMagic = 0;
    this.prayerBonus.hitpointHeal = 0;
    this.prayerBonus.damageReduction = 0;
  }

  /**
   * Computes the potion bonuses for the selected potion
   * */
  computePotionBonus() {
    this.resetPotionBonus();
    if (this.potionSelected) {
      const bonusID = items[herbloreItemData[this.potionID].itemID[this.potionTier]].potionBonusID;
      const bonusValue = items[herbloreItemData[this.potionID].itemID[this.potionTier]].potionBonus;
      switch (bonusID) {
        case 0: // Melee Accuracy
          this.herbloreBonus.meleeAccuracy = bonusValue;
          break;
        case 1: // Melee Evasion
          this.herbloreBonus.meleeEvasion = bonusValue;
          break;
        case 2: // Melee Strength
          this.herbloreBonus.meleeStrength = bonusValue;
          break;
        case 3: // Ranged Evasion/Accuracy
          this.herbloreBonus.rangedEvasion = bonusValue;
          this.herbloreBonus.rangedAccuracy = bonusValue;
          break;
        case 4: // Ranged Strength
          this.herbloreBonus.rangedStrength = bonusValue;
          break;
        case 5: // Magic Evasion/Accruracy
          this.herbloreBonus.magicEvasion = bonusValue;
          this.herbloreBonus.magicAccuracy = bonusValue;
          break;
        case 6: // Magic Damage
          this.herbloreBonus.magicDamage = bonusValue;
          break;
        case 7: // HP regen
          this.herbloreBonus.hpRegen = bonusValue;
          break;
        case 8: // Damage Reduction
          this.herbloreBonus.damageReduction = bonusValue;
          break;
        case 9: // Diamond luck
          this.herbloreBonus.diamondLuck = true;
          break;
        case 10: // Divine
          this.herbloreBonus.divine = bonusValue;
          break;
        case 11: // Lucky Herb
          this.herbloreBonus.luckyHerb = bonusValue;
          break;
        default:
          console.error(`Unknown Potion Bonus: ${bonusID}`);
      }
    }
  }
  /**
   * Resets the potion bonuses to none
   */
  resetPotionBonus() {
    this.herbloreBonus.meleeAccuracy = 0; // 0
    this.herbloreBonus.meleeEvasion = 0; // 1
    this.herbloreBonus.meleeStrength = 0; // 2
    this.herbloreBonus.rangedAccuracy = 0; // 3
    this.herbloreBonus.rangedEvasion = 0; // 3
    this.herbloreBonus.rangedStrength = 0; // 4
    this.herbloreBonus.magicEvasion = 0; // 5
    this.herbloreBonus.magicAccuracy = 0; // 5
    this.herbloreBonus.magicDamage = 0; // 6
    this.herbloreBonus.hpRegen = 0; // 7
    this.herbloreBonus.damageReduction = 0; // 8
    this.herbloreBonus.diamondLuck = false; // 9
    this.herbloreBonus.divine = 0; // 10
    this.herbloreBonus.luckyHerb = 0; // 11
  }
  /**
  * Resets the properties of this that refer to equipment stats to their default values
  */
  resetGearStats() {
    this.equipStats.attackSpeed = 4000;
    this.equipStats.strengthBonus = 0;
    this.equipStats.attackBonus = [0, 0, 0];
    this.equipStats.rangedAttackBonus = 0;
    this.equipStats.rangedStrengthBonus = 0;
    this.equipStats.magicAttackBonus = 0;
    this.equipStats.magicDamageBonus = 0;
    this.equipStats.defenceBonus = 0;
    this.equipStats.damageReduction = 0;
    this.equipStats.rangedDefenceBonus = 0;
    this.equipStats.magicDefenceBonus = 0;
    this.equipStats.attackLevelRequired = 1;
    this.equipStats.rangedLevelRequired = 1;
    this.equipStats.magicLevelRequired = 1;
    this.equipStats.defenceLevelRequired = 1;
    this.equipStats.slayerXPBonus = 0;
    this.equipStats.chanceToDoubleLoot = 0;
  }
  /**
  * Iterate through all the combatAreas and DUNGEONS to create a set of monsterSimData and dungeonSimData
  */
  simulateCombat() {
    this.simStartTime = performance.now();
    this.simCancelled = false;
    // Start by grabbing the player stats
    const playerStats = {
      attackSpeed: this.combatStats.attackSpeed,
      attackType: this.combatStats.attackType,
      maxAttackRoll: this.combatStats.maxAttackRoll,
      maxHit: this.combatStats.maxHit,
      maxDefRoll: this.combatStats.maxDefRoll,
      maxMagDefRoll: this.combatStats.maxMagDefRoll,
      maxRngDefRoll: this.combatStats.maxRngDefRoll,
      xpBonus: 0,
      avgHPRegen: 1 + Math.floor(this.playerLevels.Hitpoints / 10),
      damageReduction: this.combatStats.damageReduction,
      diamondLuck: this.herbloreBonus.diamondLuck,
      hasSpecialAttack: false,
      specialData: {},
      startingGP: 50000000,
      levels: Object.assign({}, this.playerLevels), // Shallow copy of player levels
      activeItems: {
        Hitpoints_Skillcape: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Hitpoints_Skillcape || this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Max_Skillcape),
        Ranged_Skillcape: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Ranged_Skillcape || this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Max_Skillcape),
        Magic_Skillcape: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Magic_Skillcape || this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Max_Skillcape),
        Prayer_Skillcape: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Prayer_Skillcape || this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Max_Skillcape),
        Firemaking_Skillcape: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Firemaking_Skillcape || this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Max_Skillcape),
        Cape_of_Arrow_Preservation: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Cape_of_Arrow_Preservation),

        Gold_Ruby_Ring: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Ring] == CONSTANTS.item.Gold_Ruby_Ring), // Regen Boost
        Gold_Diamond_Ring: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Ring] == CONSTANTS.item.Gold_Diamond_Ring), // Flee Combat
        Gold_Emerald_Ring: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Ring] == CONSTANTS.item.Gold_Emerald_Ring), // XP Boost
        Gold_Sapphire_Ring: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Ring] == CONSTANTS.item.Gold_Sapphire_Ring), // Reflect

        Fighter_Amulet: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Amulet] == CONSTANTS.item.Fighter_Amulet), // Attack stun
        Warlock_Amulet: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Amulet] == CONSTANTS.item.Warlock_Amulet && this.combatStats.attackType == 2), // Magic Healing
        Guardian_Amulet: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Amulet] == CONSTANTS.item.Guardian_Amulet), // Damage reduction on getting hit
        Deadeye_Amulet: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Amulet] == CONSTANTS.item.Deadeye_Amulet && this.combatStats.attackType == 1), // Ranged criticals

        Cloudburst_Staff: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Weapon] == CONSTANTS.item.Cloudburst_Staff && (this.waterSpells.includes(this.selectedSpell))),
        Confetti_Crossbow: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Weapon] == CONSTANTS.item.Confetti_Crossbow),
        Stormsnap: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Weapon] == CONSTANTS.item.Stormsnap),
        Slayer_Crossbow: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Weapon] == CONSTANTS.item.Slayer_Crossbow),
        Big_Ron: (this.parent.gearSelected[CONSTANTS.equipmentSlot.Weapon] == CONSTANTS.item.Big_Ron),
      },
      prayerPointsPerAttack: 0,
      prayerPointsPerEnemy: 0,
      prayerPointsPerHeal: 0,
      prayerXPperDamage: 1 / numberMultiplier / 2,
      isProtected: false,
    };
    // Special Attack
    if (items[this.parent.gearSelected[CONSTANTS.equipmentSlot.Weapon]].hasSpecialAttack) {
      playerStats.hasSpecialAttack = true;
      playerStats.specialData = playerSpecialAttacks[items[this.parent.gearSelected[CONSTANTS.equipmentSlot.Weapon]].specialAttackID];
    }
    // Regen Calculation
    if (playerStats.activeItems.Hitpoints_Skillcape) {
      playerStats.avgHPRegen += 1 * numberMultiplier;
    }
    if (this.prayerSelected[CONSTANTS.prayer.Rapid_Heal]) playerStats.avgHPRegen *= 2;
    playerStats.avgHPRegen *= (1 + this.herbloreBonus.hpRegen / 100);
    if (playerStats.activeItems.Gold_Ruby_Ring) {
      playerStats.avgHPRegen = Math.floor(playerStats.avgHPRegen * (1 + items[CONSTANTS.item.Gold_Ruby_Ring].hpRegenBonus / 100));
    }
    // Other Bonuses
    if (playerStats.activeItems.Gold_Emerald_Ring) {
      playerStats.xpBonus = 0.07;
    }
    this.currentSim.canTopazDrop = false;
    if (this.parent.gearSelected[CONSTANTS.equipmentSlot.Ring] == CONSTANTS.item.Gold_Topaz_Ring) {
      this.currentSim.gpBonus = 1.15;
      this.currentSim.canTopazDrop = true;
    } else if (this.parent.gearSelected[CONSTANTS.equipmentSlot.Ring] == CONSTANTS.item.Aorpheats_Signet_Ring) {
      this.currentSim.gpBonus = 2;
    } else {
      this.currentSim.gpBonus = 1;
    }
    Object.assign(this.currentSim.equipStats, this.equipStats);
    this.currentSim.lootBonus = 1 + this.equipStats.chanceToDoubleLoot / 100;
    this.currentSim.slayerXPBonus = this.equipStats.slayerXPBonus;
    this.currentSim.herbConvertChance = this.herbloreBonus.luckyHerb / 100;
    this.currentSim.doBonesAutoBury = (this.parent.gearSelected[CONSTANTS.equipmentSlot.Amulet] == CONSTANTS.item.Bone_Necklace);
    // Compute prayer point usage and xp gain
    const hasPrayerCape = playerStats.activeItems.Prayer_Skillcape;
    for (let i = 0; i < PRAYER.length; i++) {
      if (this.prayerSelected[i]) {
        // Point Usage
        if (hasPrayerCape) {
          let attQty = Math.floor(PRAYER[i].pointsPerPlayer / 2);
          if (attQty == 0 && PRAYER[i].pointsPerPlayer != 0) {
            attQty = 1;
          }
          let enemyQty = Math.floor(PRAYER[i].pointsPerEnemy / 2);
          if (enemyQty == 0 && PRAYER[i].pointsPerEnemy != 0) {
            enemyQty = 1;
          }
          let healQty = Math.floor(PRAYER[i].pointsPerRegen / 2);
          if (healQty == 0 && PRAYER[i].pointsPerRegen != 0) {
            healQty = 1;
          }
          playerStats.prayerPointsPerAttack += attQty;
          playerStats.prayerPointsPerEnemy += enemyQty;
          playerStats.prayerPointsPerHeal += healQty;
        } else {
          playerStats.prayerPointsPerAttack += PRAYER[i].pointsPerPlayer;
          playerStats.prayerPointsPerEnemy += PRAYER[i].pointsPerEnemy;
          playerStats.prayerPointsPerHeal += PRAYER[i].pointsPerRegen;
        }
        // XP Gain
        playerStats.prayerXPperDamage += 2 * PRAYER[i].pointsPerPlayer / numberMultiplier;
      }
    }
    playerStats.prayerPointsPerAttack *= (1 - this.herbloreBonus.divine / 100);
    playerStats.prayerPointsPerEnemy *= (1 - this.herbloreBonus.divine / 100);
    playerStats.prayerPointsPerHeal *= (1 - this.herbloreBonus.divine / 100);
    this.currentSim.options = {
      Ntrials: this.Ntrials,
      Nhitmax: this.Nhitmax,
    };
    this.currentSim.playerStats = playerStats;
    this.currentSim.isSlayerTask = this.isSlayerTask;
    Object.assign(this.currentSim.herbloreBonus, this.herbloreBonus);
    Object.assign(this.currentSim.prayerBonus, this.prayerBonus);
    Object.assign(this.currentSim.combatStats, this.combatStats);
    Object.assign(this.currentSim.attackStyle, this.attackStyle);

    // Reset the simulation status of all enemies
    this.resetSimDone();
    // Set up simulation queue
    this.simulationQueue = [];
    // Queue simulation of monsters in combat areas
    combatAreas.forEach((area) => {
      area.monsters.forEach((monsterID) => {
        if (this.monsterSimFilter[monsterID] && !this.monsterSimData[monsterID].inQueue) {
          this.monsterSimData[monsterID].inQueue = true;
          this.simulationQueue.push({monsterID: monsterID});
        }
      });
    });
    // Queue simulation of monsters in slayer areas
    slayerAreas.forEach((area) => {
      area.monsters.forEach((monsterID) => {
        if (this.monsterSimFilter[monsterID] && !this.monsterSimData[monsterID].inQueue) {
          this.monsterSimData[monsterID].inQueue = true;
          this.simulationQueue.push({monsterID: monsterID});
        }
      });
    });
    // Queue simulation of monsters in dungeons
    for (let i = 0; i < DUNGEONS.length; i++) {
      if (this.dungeonSimFilter[i]) {
        for (let j = 0; j < DUNGEONS[i].monsters.length; j++) {
          const monsterID = DUNGEONS[i].monsters[j];
          if (!this.monsterSimData[monsterID].inQueue) {
            this.monsterSimData[monsterID].inQueue = true;
            this.simulationQueue.push({monsterID: monsterID});
          }
        }
      }
    }
    // An attempt to sort jobs my relative complexity so they go from highest to lowest.
    this.simulationQueue = this.simulationQueue.sort((jobA, jobB)=>{
      const jobAComplex = this.enemyStats[jobA.monsterID].hitpoints / this.calculateAccuracy(playerStats, this.enemyStats[jobA.monsterID]);
      const jobBComplex = this.enemyStats[jobB.monsterID].hitpoints / this.calculateAccuracy(playerStats, this.enemyStats[jobB.monsterID]);
      return jobBComplex - jobAComplex;
    });
    // Start simulation workers
    document.getElementById('MCS Simulate Button').textContent = `Simulating... (0/${this.simulationQueue.length})`;
    this.initializeSimulationJobs();
  }

  /**
   * Gets the stats of a monster
   * @param {number} monsterID
   * @return {enemyStats}
   */
  getEnemyStats(monsterID) {
    /** @type {enemyStats} */
    const enemyStats = {
      hitpoints: 0,
      attackSpeed: 0,
      attackType: 0,
      maxAttackRoll: 0,
      maxHit: 0,
      maxDefRoll: 0,
      maxMagDefRoll: 0,
      maxRngDefRoll: 0,
      hasSpecialAttack: false,
      specialAttackChances: [],
      specialIDs: [],
      specialLength: 0,
    };
    // Calculate Enemy Stats
    enemyStats.hitpoints = MONSTERS[monsterID].hitpoints * numberMultiplier;
    enemyStats.attackSpeed = MONSTERS[monsterID].attackSpeed;
    const effectiveDefenceLevel = Math.floor(MONSTERS[monsterID].defenceLevel + 8 + 1);
    enemyStats.maxDefRoll = effectiveDefenceLevel * (MONSTERS[monsterID].defenceBonus + 64);

    const effectiveRangedDefenceLevel = Math.floor(MONSTERS[monsterID].defenceLevel + 8 + 1);
    enemyStats.maxRngDefRoll = effectiveRangedDefenceLevel * (MONSTERS[monsterID].defenceBonusRanged + 64);
    const effectiveMagicDefenceLevel = Math.floor((Math.floor(MONSTERS[monsterID].magicLevel * 0.7) + Math.floor(MONSTERS[monsterID].defenceLevel * 0.3)) + 8 + 1);
    enemyStats.maxMagDefRoll = effectiveMagicDefenceLevel * (MONSTERS[monsterID].defenceBonusMagic + 64);
    enemyStats.attackType = MONSTERS[monsterID].attackType;

    if (MONSTERS[monsterID].attackType === CONSTANTS.attackType.Melee) {
      const effectiveAttackLevel = Math.floor(MONSTERS[monsterID].attackLevel + 8 + 1);
      enemyStats.maxAttackRoll = effectiveAttackLevel * (MONSTERS[monsterID].attackBonus + 64);
      const effectiveStrengthLevel = Math.floor(MONSTERS[monsterID].strengthLevel + 8 + 1);
      enemyStats.maxHit = Math.floor(numberMultiplier * (1.3 + (effectiveStrengthLevel / 10) + (MONSTERS[monsterID].strengthBonus / 80) + (effectiveStrengthLevel * MONSTERS[monsterID].strengthBonus / 640)));
    } else if (MONSTERS[monsterID].attackType === CONSTANTS.attackType.Ranged) {
      const effectiveAttackLevel = Math.floor(MONSTERS[monsterID].rangedLevel + 8 + 1);
      enemyStats.maxAttackRoll = effectiveAttackLevel * (MONSTERS[monsterID].attackBonusRanged + 64);
      const effectiveStrengthLevel = Math.floor(MONSTERS[monsterID].rangedLevel + 8 + 1);
      enemyStats.maxHit = Math.floor(numberMultiplier * (1.3 + (effectiveStrengthLevel / 10) + (MONSTERS[monsterID].strengthBonusRanged / 80) + (effectiveStrengthLevel * MONSTERS[monsterID].strengthBonusRanged / 640)));
    } else if (MONSTERS[monsterID].attackType === CONSTANTS.attackType.Magic) {
      const effectiveAttackLevel = Math.floor(MONSTERS[monsterID].magicLevel + 8 + 1);
      enemyStats.maxAttackRoll = effectiveAttackLevel * (MONSTERS[monsterID].attackBonusMagic + 64);
      if (MONSTERS[monsterID].selectedSpell === null || MONSTERS[monsterID].selectedSpell === undefined) enemyStats.maxHit = Math.floor(numberMultiplier * (MONSTERS[monsterID].setMaxHit + MONSTERS[monsterID].setMaxHit * (MONSTERS[monsterID].damageBonusMagic / 100)));
      else enemyStats.maxHit = Math.floor(numberMultiplier * (SPELLS[MONSTERS[monsterID].selectedSpell].maxHit + SPELLS[MONSTERS[monsterID].selectedSpell].maxHit * (MONSTERS[monsterID].damageBonusMagic / 100)));
    }
    // Calculate special attacks
    if (MONSTERS[monsterID].hasSpecialAttack) {
      enemyStats.hasSpecialAttack = true;
      for (let i = 0; i < MONSTERS[monsterID].specialAttackID.length; i++) {
        if (MONSTERS[monsterID].overrideSpecialChances !== undefined) {
          enemyStats.specialAttackChances.push(MONSTERS[monsterID].overrideSpecialChances[i]);
        } else {
          enemyStats.specialAttackChances.push(enemySpecialAttacks[MONSTERS[monsterID].specialAttackID[i]].chance);
        }
        enemyStats.specialIDs.push(MONSTERS[monsterID].specialAttackID[i]);
      }
      enemyStats.specialLength = enemyStats.specialAttackChances.length;
    }
    return enemyStats;
  }

  /** Performs all data analysis post queue completion */
  performPostSimAnalysis() {
    // Perform calculation of dungeon stats
    let totXp = 0;
    let totHpXp = 0;
    let totPrayXP = 0;
    let totHits = 0;
    let totHP = 0;
    let totEnemyHP = 0;
    let totTime = 0;
    let totPrayerPoints = 0;
    let totalGPFromDamage = 0;
    let totalAttacksTaken = 0;
    let totalSimTime = 0;
    for (let i = 0; i < DUNGEONS.length; i++) {
      if (this.dungeonSimFilter[i]) {
        this.dungeonSimData[i].simSuccess = true;
        totXp = 0;
        totHpXp = 0;
        totPrayXP = 0;
        totHits = 0;
        totHP = 0;
        totEnemyHP = 0;
        totPrayerPoints = 0;
        totTime = 0;
        totalGPFromDamage = 0;
        totalAttacksTaken = 0;
        for (let j = 0; j < DUNGEONS[i].monsters.length; j++) {
          const mInd = DUNGEONS[i].monsters[j];
          totXp += this.monsterSimData[mInd].xpPerEnemy;
          totHpXp += this.monsterSimData[mInd].hpxpPerEnemy;
          totPrayXP += this.monsterSimData[mInd].prayerXpPerEnemy;
          totHits += this.monsterSimData[mInd].attacksMade;
          totHP += this.monsterSimData[mInd].hpPerEnemy;
          totEnemyHP += MONSTERS[mInd].hitpoints * numberMultiplier;
          totTime += this.monsterSimData[mInd].avgKillTime;
          totPrayerPoints += this.monsterSimData[mInd].ppConsumedPerSecond * this.monsterSimData[mInd].killTimeS;
          totalGPFromDamage += this.monsterSimData[mInd].gpFromDamage;
          totalAttacksTaken += this.monsterSimData[mInd].attacksTaken;

          if (!this.monsterSimData[mInd].simSuccess) {
            this.dungeonSimData[i].simSuccess = false;
            break;
          }
        }
        totalSimTime = 0;
        for (let j = 0; j < this.condensedDungeonMonsters[i].length; j++) {
          const mInd = this.condensedDungeonMonsters[i][j].id;
          totalSimTime += this.monsterSimData[mInd].simulationTime;
        }
        if (this.dungeonSimData[i].simSuccess) {
          this.dungeonSimData[i].xpPerSecond = totXp / totTime * 1000;
          this.dungeonSimData[i].xpPerHit = totXp / totHits;
          this.dungeonSimData[i].hpxpPerSecond = totHpXp / totTime * 1000;
          this.dungeonSimData[i].prayerXpPerSecond = totPrayXP / totTime * 1000;
          this.dungeonSimData[i].hpPerSecond = totHP / totTime * 1000;
          this.dungeonSimData[i].dmgPerSecond = totEnemyHP / totTime * 1000;
          this.dungeonSimData[i].avgKillTime = totTime;
          this.dungeonSimData[i].attacksMade = totHits;
          this.dungeonSimData[i].avgHitDmg = totEnemyHP / totHits;
          this.dungeonSimData[i].killTimeS = totTime / 1000;
          this.dungeonSimData[i].ppConsumedPerSecond = totPrayerPoints / this.dungeonSimData[i].killTimeS;
          this.dungeonSimData[i].gpFromDamage = totalGPFromDamage;
          this.dungeonSimData[i].attacksTaken = totalAttacksTaken;
          this.dungeonSimData[i].attacksTakenPerSecond = totalAttacksTaken / totTime * 1000;
          this.dungeonSimData[i].attacksMadePerSecond = totHits / totTime * 1000;
          this.dungeonSimData[i].simulationTime = totalSimTime;
        }
      } else {
        this.dungeonSimData[i].simSuccess = false;
      }
    }
    // Update other data
    this.updateGPData();
    this.updateSlayerXP();
    this.updateHerbloreXP();
    this.updateSignetChance();
    console.log(`Elapsed Simulation Time: ${performance.now() - this.simStartTime}ms`);
  }
  /** Starts processing simulation jobs */
  initializeSimulationJobs() {
    if (!this.simInProgress) {
      if (this.simulationQueue.length > 0) {
        this.simInProgress = true;
        this.currentJob = 0;
        for (let i = 0; i < this.simulationWorkers.length; i++) {
          this.simulationWorkers[i].selfTime = 0;
          if (i < this.simulationQueue.length) {
            this.startJob(i);
          } else {
            break;
          }
        }
      } else {
        this.performPostSimAnalysis();
        this.parent.updateDisplayPostSim();
      }
    }
  }

  /** Starts a job for a given worker
   * @param {number} workerID
  */
  startJob(workerID) {
    if (this.currentJob < this.simulationQueue.length && !this.simCancelled) {
      const monsterID = this.simulationQueue[this.currentJob].monsterID;
      this.modifyCurrentSimStatsForMonster(monsterID);
      this.simulationWorkers[workerID].worker.postMessage({action: 'START_SIMULATION',
        monsterID: monsterID,
        monsterStats: this.enemyStats[monsterID],
        playerStats: this.currentSim.playerStats,
        simOptions: this.currentSim.options});
      this.simulationWorkers[workerID].inUse = true;
      this.currentJob++;
    } else {
      // Check if none of the workers are in use
      let allDone = true;
      this.simulationWorkers.forEach((simWorker)=>{
        if (simWorker.inUse) {
          allDone = false;
        }
      });
      if (allDone) {
        this.simInProgress = false;
        this.performPostSimAnalysis();
        this.parent.updateDisplayPostSim();
        if (this.isTestMode) {
          this.testCount++;
          if (this.testCount < this.testMax) {
            this.simulateCombat();
          } else {
            this.isTestMode = false;
          }
        }
        // console.log(this.simulationWorkers);
      }
    }
  }

  /**
   * Modifies the playerStats before starting a job for a specific monster
   * @param {number} monsterID Index of MONSTERS
   */
  modifyCurrentSimStatsForMonster(monsterID) {
    // Do check for protection prayer
    switch (MONSTERS[monsterID].attackType) {
      case CONSTANTS.attackType.Melee:
        this.currentSim.playerStats.isProtected = this.currentSim.prayerBonus.protectFromMelee > 0;
        break;
      case CONSTANTS.attackType.Ranged:
        this.currentSim.playerStats.isProtected = this.currentSim.prayerBonus.protectFromRanged > 0;
        break;
      case CONSTANTS.attackType.Magic:
        this.currentSim.playerStats.isProtected = this.currentSim.prayerBonus.protectFromMagic > 0;
        break;
    }
    // Do preprocessing of player stats for special weapons TODO: Modify this so it doesn't draw from current UI options
    if (this.currentSim.playerStats.activeItems.Stormsnap || this.currentSim.playerStats.activeItems.Slayer_Crossbow) {
      let attackStyleBonus = 1;
      // Ranged
      if (this.attackStyle.Ranged == 0) {
        attackStyleBonus += 3;
      }
      let rangedStrengthBonus = this.currentSim.equipStats.rangedStrengthBonus;
      let rangedAttackBonus = this.currentSim.equipStats.rangedAttackBonus;
      if (this.currentSim.playerStats.activeItems.Stormsnap) {
        rangedStrengthBonus += Math.floor(110 + (1 + (MONSTERS[monsterID].magicLevel * 6) / 33));
        rangedAttackBonus += Math.floor(102 * (1 + (MONSTERS[monsterID].magicLevel * 6) / 5500));
      }
      if (this.currentSim.playerStats.activeItems.Slayer_Crossbow && (MONSTERS[monsterID].slayerXP != undefined || this.currentSim.isSlayerTask)) {
        rangedStrengthBonus = Math.floor(rangedStrengthBonus * items[CONSTANTS.item.Slayer_Crossbow].slayerStrengthMultiplier);
      }
      const effectiveAttackLevel = Math.floor(this.currentSim.playerStats.levels.Ranged + 8 + attackStyleBonus);
      this.currentSim.playerStats.maxAttackRoll = Math.floor(effectiveAttackLevel * (rangedAttackBonus + 64) * (1 + (this.currentSim.prayerBonus.rangedAccuracy / 100)) * (1 + this.currentSim.herbloreBonus.rangedAccuracy / 100));
      const effectiveStrengthLevel = Math.floor(this.currentSim.playerStats.levels.Ranged + attackStyleBonus);
      this.currentSim.playerStats.maxHit = Math.floor(numberMultiplier * ((1.3 + effectiveStrengthLevel / 10 + rangedStrengthBonus / 80 + effectiveStrengthLevel * rangedStrengthBonus / 640) * (1 + (this.currentSim.prayerBonus.rangedDamage / 100)) * (1 + this.currentSim.herbloreBonus.rangedStrength / 100)));
    } else if (this.currentSim.playerStats.activeItems.Big_Ron ) {
      // Melee
      let meleeStrengthBonus = this.currentSim.equipStats.strengthBonus;
      if (this.currentSim.playerStats.activeItems.Big_Ron && MONSTERS[monsterID].isBoss) {
        meleeStrengthBonus = Math.floor(meleeStrengthBonus * items[CONSTANTS.item.Big_Ron].bossStrengthMultiplier);
      }
      const effectiveStrengthLevel = Math.floor(this.currentSim.playerStats.levels.Strength + 8 + 1);
      this.currentSim.playerStats.maxHit = Math.floor(numberMultiplier * ((1.3 + effectiveStrengthLevel / 10 + meleeStrengthBonus / 80 + effectiveStrengthLevel * meleeStrengthBonus / 640) * (1 + (this.currentSim.prayerBonus.meleeDamage / 100)) * (1 + this.currentSim.herbloreBonus.meleeStrength / 100)));
    }
  }
  /**
   * Attempts to cancel the currently running simulation and sends a cancelation message to each of the active workers
   */
  cancelSimulation() {
    this.simCancelled = true;
    this.simulationWorkers.forEach((simWorker)=>{
      if (simWorker.inUse) {
        simWorker.worker.postMessage({action: 'CANCEL_SIMULATION'});
      }
    });
  }

  /**
   * Processes a message recieved from one of the simulation workers
   * @param {MessageEvent} event The event data of the worker
   * @param {number} workerID The ID of the worker that sent the message
   */
  processWorkerMessage(event, workerID) {
    // console.log(`Recieved Message from worker: ${workerID}`);
    switch (event.data.action) {
      case 'FINISHED_SIM':
        // Send next job in queue to worker
        this.simulationWorkers[workerID].inUse = false;
        this.simulationWorkers[workerID].selfTime += event.data.selfTime;
        // Transfer data into monsterSimData
        const monsterID = event.data.monsterID;
        Object.assign(this.monsterSimData[monsterID], event.data.simResult);
        this.monsterSimData[monsterID].simulationTime = event.data.selfTime;
        document.getElementById('MCS Simulate Button').textContent = `Simulating... (${this.currentJob - 1}/${this.simulationQueue.length})`;
        // console.log(event.data.simResult);
        // Attempt to add another job to the worker
        this.startJob(workerID);
        break;
    }
  }
  /**
  * Resets the simulation status for each monster
  */
  resetSimDone() {
    for (let i = 0; i < MONSTERS.length; i++) {
      this.monsterSimData[i].inQueue = false;
      this.monsterSimData[i].simSuccess = false;
    }
  }
  /**
  * Computes the accuracy of attacker vs target
  * @param {Object} attacker
  * @param {number} attacker.attackType Attack Type Melee:0, Ranged:1, Magic:2
  * @param {number} attacker.maxAttackRoll Accuracy Rating
  * @param {Object} target
  * @param {number} target.maxDefRoll Melee Evasion Rating
  * @param {number} target.maxRngDefRoll Ranged Evasion Rating
  * @param {number} target.maxMagDefRoll Magic Evasion Rating
  * @return {number}
  */
  calculateAccuracy(attacker, target) {
    let targetDefRoll = 0;
    if (attacker.attackType == 0) {
      targetDefRoll = target.maxDefRoll;
    } else if (attacker.attackType == 1) {
      targetDefRoll = target.maxRngDefRoll;
    } else {
      targetDefRoll = target.maxMagDefRoll;
    }
    let accuracy = 0;
    if (attacker.maxAttackRoll < targetDefRoll) {
      accuracy = (0.5 * attacker.maxAttackRoll / targetDefRoll) * 100;
    } else {
      accuracy = (1 - 0.5 * targetDefRoll / attacker.maxAttackRoll) * 100;
    }
    return accuracy;
  }
  /**
  * Extracts a set of data for plotting that matches the keyValue in monsterSimData and dungeonSimData
  * @param {string} keyValue
  * @return {Array<number>}
  */
  getDataSet(keyValue) {
    let dataMultiplier = 1;
    if (this.selectedPlotIsTime) {
      dataMultiplier = this.timeMultiplier;
    }
    const dataSet = [];
    if (!this.parent.isViewingDungeon) {
      // Compile data from monsters in combat zones
      combatAreas.forEach((area) => {
        area.monsters.forEach((monsterID) => {
          dataSet.push((this.monsterSimFilter[monsterID] && this.monsterSimData[monsterID].simSuccess) ? this.monsterSimData[monsterID][keyValue] * dataMultiplier : 0);
        });
      });
      // Compile data from monsters in slayer zones
      slayerAreas.forEach((area) => {
        area.monsters.forEach((monsterID) => {
          dataSet.push((this.monsterSimFilter[monsterID] && this.monsterSimData[monsterID].simSuccess) ? this.monsterSimData[monsterID][keyValue] * dataMultiplier : 0);
        });
      });
      // Perform simulation of monsters in dungeons
      for (let i = 0; i < DUNGEONS.length; i++) {
        dataSet.push((this.dungeonSimFilter[i] && this.dungeonSimData[i].simSuccess) ? this.dungeonSimData[i][keyValue] * dataMultiplier : 0);
      }
    } else {
      const dungeonID = this.parent.viewedDungeonID;
      // Special keys that multiply by quantity
      const qtyMultiplier = keyValue == 'killTimeS';
      const isSignet = keyValue == 'signetChance';
      // 'xpPerSecond', 'hpxpPerSecond', 'prayerXpPerSecond', 'slayerXpPerSecond', 'xpPerHit', 'hpPerSecond', 'ppConsumedPerSecond', 'dmgPerSecond', 'killTimeS', 'avgHitDmg', 'gpPerKill', 'gpPerSecond', 'herbloreXPPerSecond', 'signetChance'
      this.condensedDungeonMonsters[dungeonID].forEach((monster) => {
        if (!isSignet) {
          if (qtyMultiplier) {
            dataSet.push((this.monsterSimData[monster.id].simSuccess) ? this.monsterSimData[monster.id][keyValue] * dataMultiplier * monster.quantity : 0);
          } else {
            dataSet.push((this.monsterSimData[monster.id].simSuccess) ? this.monsterSimData[monster.id][keyValue] * dataMultiplier : 0);
          }
        } else {
          dataSet.push(0);
        }
      });
      if (isSignet) {
        const bossMonster = this.condensedDungeonMonsters[dungeonID][this.condensedDungeonMonsters[dungeonID].length - 1];
        dataSet[dataSet.length - 1] = (this.monsterSimData[bossMonster.id].simSuccess) ? this.monsterSimData[bossMonster.id][keyValue] * dataMultiplier : 0;
      }
    }
    return dataSet;
  }
  /**
   * Creates a string to paste into your favourite spreadsheet software
   * @return {string}
   */
  exportData() {
    let exportString = '';
    const colDel = '\t';
    const colLen = colDel.length;
    const rowDel = '\n';
    const rowLen = rowDel.length;
    if (this.exportName) {
      exportString += 'Monster/Dungeon Name' + colDel;
    }
    for (let i = 0; i < this.parent.plotTypeDropdownOptions.length; i++) {
      if (this.exportDataType[i]) {
        if (this.parent.plotTypeIsTime[i]) {
          exportString += this.parent.plotTypeDropdownOptions[i] + this.parent.selectedTimeUnit + colDel;
        } else {
          exportString += this.parent.plotTypeDropdownOptions[i] + colDel;
        }
      }
    }
    exportString = exportString.slice(0, -colLen);
    exportString += rowDel;
    combatAreas.forEach((area) => {
      area.monsters.forEach((monsterID) => {
        if (this.exportNonSimmed || (!this.exportNonSimmed && this.monsterSimFilter[monsterID])) {
          if (this.exportName) exportString += this.parent.getMonsterName(monsterID) + colDel;
          for (let i = 0; i < this.parent.plotTypeDropdownValues.length; i++) {
            if (this.exportDataType[i]) {
              exportString += (this.monsterSimFilter[monsterID] && this.monsterSimData[monsterID].simSuccess) ? this.monsterSimData[monsterID][this.parent.plotTypeDropdownValues[i]] * ((this.parent.plotTypeIsTime[i]) ? this.timeMultiplier : 1) : 0;
              exportString += colDel;
            }
          }
          exportString = exportString.slice(0, -colLen);
          exportString += rowDel;
        }
      });
    });
    slayerAreas.forEach((area) => {
      area.monsters.forEach((monsterID) => {
        if (this.exportNonSimmed || (!this.exportNonSimmed && this.monsterSimFilter[monsterID])) {
          if (this.exportName) exportString += this.parent.getMonsterName(monsterID) + colDel;
          for (let i = 0; i < this.parent.plotTypeDropdownValues.length; i++) {
            if (this.exportDataType[i]) {
              exportString += (this.monsterSimFilter[monsterID] && this.monsterSimData[monsterID].simSuccess) ? this.monsterSimData[monsterID][this.parent.plotTypeDropdownValues[i]] * ((this.parent.plotTypeIsTime[i]) ? this.timeMultiplier : 1) : 0;
              exportString += colDel;
            }
          }
          exportString = exportString.slice(0, -colLen);
          exportString += rowDel;
        }
      });
    });
    for (let i = 0; i < DUNGEONS.length; i++) {
      if (this.exportNonSimmed || (!this.exportNonSimmed && this.dungeonSimFilter[i])) {
        if (this.exportName) exportString += this.parent.getDungeonName(i) + colDel;
        for (let j = 0; j < this.parent.plotTypeDropdownValues.length; j++) {
          if (this.exportDataType[j]) {
            exportString += (this.dungeonSimFilter[i] && this.dungeonSimData[i].simSuccess) ? this.dungeonSimData[i][this.parent.plotTypeDropdownValues[j]] * ((this.parent.plotTypeIsTime[j]) ? this.timeMultiplier : 1) : 0;
            exportString += colDel;
          }
        }
        exportString = exportString.slice(0, -colLen);
        exportString += rowDel;
        if (this.exportDungeonMonsters) {
          this.condensedDungeonMonsters[i].forEach((monster) => {
            if (this.exportName) exportString += this.parent.getMonsterName(monster.id) + colDel;
            for (let j = 0; j < this.parent.plotTypeDropdownValues.length; j++) {
              if (this.exportDataType[j]) {
                const dataMultiplier = (this.parent.plotTypeDropdownValues[j] == 'killTimeS') ? monster.quantity : 1;
                if (this.parent.plotTypeDropdownValues[j] == 'signetChance') {
                  exportString += '0';
                } else {
                  exportString += (this.monsterSimData[monster.id].simSuccess) ? this.monsterSimData[monster.id][this.parent.plotTypeDropdownValues[j]] * ((this.parent.plotTypeIsTime[j]) ? this.timeMultiplier : 1) * dataMultiplier : 0;
                }
                exportString += colDel;
              }
            }
            exportString = exportString.slice(0, -colLen);
            exportString += rowDel;
          });
        }
      }
    }
    exportString = exportString.slice(0, -rowLen);
    return exportString;
  }
  /**
   * Finds the monsters/dungeons you can currently fight
   * @return {Array<boolean>}
   */
  getEnterSet() {
    const enterSet = [];
    // Compile data from monsters in combat zones
    for (let i = 0; i < combatAreas.length; i++) {
      for (let j = 0; j < combatAreas[i].monsters.length; j++) {
        enterSet.push(true);
      }
    }
    for (let i = 0; i < slayerAreas.length; i++) {
      let canEnter = true;
      if (slayerAreas[i].slayerLevel != undefined && this.playerLevels.Slayer < slayerAreas[i].slayerLevel) {
        canEnter = false;
      }
      if (slayerAreas[i].slayerItem != 0) {
        let gearFound = false;
        for (let j = 0; j < this.parent.gearSelected.length; j++) {
          if (this.parent.gearSelected[j] == slayerAreas[i].slayerItem) {
            gearFound = true;
          }
        }
        if (!gearFound) {
          canEnter = false;
        }
        if (this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Slayer_Skillcape || this.parent.gearSelected[CONSTANTS.equipmentSlot.Cape] == CONSTANTS.item.Max_Skillcape) {
          canEnter = true;
        }
      }
      for (let j = 0; j < slayerAreas[i].monsters.length; j++) {
        enterSet.push(canEnter);
      }
    }
    // Perform simulation of monsters in dungeons
    for (let i = 0; i < DUNGEONS.length; i++) {
      enterSet.push(true);
    }
    return enterSet;
  }
  /**
  * Computes the average number of coins that a monster drops
  * @param {number} monsterID Index of MONSTERS
  * @return {number}
  */
  computeAverageCoins(monsterID) {
    return (MONSTERS[monsterID].dropCoins[1] + MONSTERS[monsterID].dropCoins[0] - 1) * this.currentSim.gpBonus / 2;
  }
  /**
  * Computes the chance that a monster will drop loot when it dies
  * @param {number} monsterID
  * @return {number}
  */
  computeLootChance(monsterID) {
    return ((MONSTERS[monsterID].lootChance != undefined) ? MONSTERS[monsterID].lootChance / 100 : 1);
  }
  /**
  * Computes the value of a monsters drop table respecting the loot sell settings
  * @param {number} monsterID
  * @return {number}
  */
  computeDropTableValue(monsterID) {
    // lootTable[x][0]: Item ID, [x][1]: Weight [x][2]: Max Qty
    if (MONSTERS[monsterID].lootTable && this.sellLoot != 'None') {
      let gpWeight = 0;
      let totWeight = 0;
      if (this.sellLoot == 'All') {
        MONSTERS[monsterID].lootTable.forEach((x) => {
          const itemID = x[0];
          let avgQty = (x[2] + 1) / 2;
          if (items[itemID].canOpen) {
            gpWeight += this.computeChestOpenValue(itemID) * avgQty;
          } else {
            if (this.currentSim.herbConvertChance && (items[itemID].tier === 'Herb' && items[itemID].type === 'Seeds')) {
              avgQty += 3;
              gpWeight += (items[itemID].sellsFor * (1 - this.currentSim.herbConvertChance) + items[items[itemID].grownItemID].sellsFor * this.currentSim.herbConvertChance) * x[1] * avgQty;
            } else {
              gpWeight += items[itemID].sellsFor * x[1] * avgQty;
            }
          }
          totWeight += x[1];
        });
      } else {
        MONSTERS[monsterID].lootTable.forEach((x) => {
          const itemID = x[0];
          let avgQty = (x[2] + 1) / 2;
          if (items[itemID].canOpen) {
            gpWeight += this.computeChestOpenValue(itemID) * avgQty;
          } else {
            if (this.currentSim.herbConvertChance && (items[itemID].tier === 'Herb' && items[itemID].type === 'Seeds')) {
              const herbItem = items[itemID].grownItemID;
              avgQty += 3;
              gpWeight += (items[itemID].sellsFor * (1 - this.currentSim.herbConvertChance) * ((this.shouldSell(itemID)) ? 1 : 0) + items[herbItem].sellsFor * this.currentSim.herbConvertChance * ((this.shouldSell(herbItem)) ? 1 : 0)) * x[1] * avgQty;
            } else {
              gpWeight += ((this.shouldSell(itemID)) ? items[itemID].sellsFor : 0) * x[1] * avgQty;
            }
          }
          totWeight += x[1];
        });
      }
      return gpWeight / totWeight * this.currentSim.lootBonus;
    } else {
      return 0;
    }
  }
  /**
  * Determines if an itemID should be sold and turns true/false
  * @param {number} itemID
  * @return {boolean}
  */
  shouldSell(itemID) {
    return this.saleList[itemID].sell;
  }
  /**
  * Gets an object array equal in length to the items array that determines if a particular item should be sold or kept
  * @return {Array}
  */
  getSaleList() {
    const saleList = [];
    for (let i = 0; i < items.length; i++) {
      saleList.push({
        id: i,
        name: this.parent.getItemName(i),
        sell: true,
        onLootList: false,
        lootlistID: -1,
      });
    }
    return saleList;
  }
  /**
  * Gets an object array containing only items that are obtainable from combatAreas/Dungeons
  * @return {Array}
  */
  getLootList() {
    const lootList = [];
    const specialDrops = [CONSTANTS.item.Signet_Ring_Half_B, CONSTANTS.item.Air_Shard, CONSTANTS.item.Water_Shard, CONSTANTS.item.Earth_Shard, CONSTANTS.item.Fire_Shard];
    specialDrops.forEach((itemID) => {
      lootList.push({
        id: itemID,
        name: this.parent.getItemName(itemID),
        sell: false,
      });
    });
    this.saleList[CONSTANTS.item.Signet_Ring_Half_B].onLootList = true;
    combatAreas.forEach((area) => {
      area.monsters.forEach((mID) => {
        MONSTERS[mID].lootTable.forEach((loot) => {
          if (items[loot[0]].canOpen) {
            items[loot[0]].dropTable.forEach((loot2) => {
              if (!this.saleList[loot2[0]].onLootList) {
                lootList.push({
                  id: loot2[0],
                  name: this.parent.getItemName(loot2[0]),
                  sell: false,
                });
                this.saleList[loot2[0]].onLootList = true;
              }
            });
          } else {
            if (!this.saleList[loot[0]].onLootList) {
              lootList.push({
                id: loot[0],
                name: this.parent.getItemName(loot[0]),
                sell: false,
              });
              this.saleList[loot[0]].onLootList = true;
            }
            if (items[loot[0]].tier === 'Herb' && items[loot[0]].type === 'Seeds') {
              const herbItem = items[loot[0]].grownItemID;
              if (!this.saleList[herbItem].onLootList) {
                lootList.push({
                  id: herbItem,
                  name: this.parent.getItemName(herbItem),
                  sell: false,
                });
                this.saleList[herbItem].onLootList = true;
              }
            }
          }
        });
      });
    });
    slayerAreas.forEach((area) => {
      area.monsters.forEach((mID) => {
        MONSTERS[mID].lootTable.forEach((loot) => {
          if (items[loot[0]].canOpen) {
            items[loot[0]].dropTable.forEach((loot2) => {
              if (!this.saleList[loot2[0]].onLootList) {
                lootList.push({
                  id: loot2[0],
                  name: this.parent.getItemName(loot2[0]),
                  sell: false,
                });
                this.saleList[loot2[0]].onLootList = true;
              }
            });
          } else {
            if (!this.saleList[loot[0]].onLootList) {
              lootList.push({
                id: loot[0],
                name: this.parent.getItemName(loot[0]),
                sell: false,
              });
              this.saleList[loot[0]].onLootList = true;
            }
            if (items[loot[0]].tier === 'Herb' && items[loot[0]].type === 'Seeds') {
              const herbItem = items[loot[0]].grownItemID;
              if (!this.saleList[herbItem].onLootList) {
                lootList.push({
                  id: herbItem,
                  name: this.parent.getItemName(herbItem),
                  sell: false,
                });
                this.saleList[herbItem].onLootList = true;
              }
            }
          }
        });
      });
    });
    DUNGEONS.forEach((dungeon) => {
      dungeon.rewards.forEach((item) => {
        if (items[item].canOpen) {
          items[item].dropTable.forEach((loot) => {
            if (!this.saleList[loot[0]].onLootList) {
              lootList.push({
                id: loot[0],
                name: this.parent.getItemName(loot[0]),
                sell: false,
              });
              this.saleList[loot[0]].onLootList = true;
            }
          });
        } else {
          if (!this.saleList[item].onLootList) {
            lootList.push({
              id: item,
              name: this.parent.getItemName(item),
              sell: false,
            });
            this.saleList[item].onLootList = true;
          }
        }
      });
    });
    const elementalChests = [CONSTANTS.item.Air_Chest, CONSTANTS.item.Water_Chest, CONSTANTS.item.Earth_Chest, CONSTANTS.item.Fire_Chest];
    elementalChests.forEach((chest) => {
      items[chest].dropTable.forEach((loot2) => {
        if (!this.saleList[loot2[0]].onLootList) {
          lootList.push({
            id: loot2[0],
            name: this.parent.getItemName(loot2[0]),
            sell: false,
          });
          this.saleList[loot2[0]].onLootList = true;
        }
      });
    });
    // Alphabetize loot list
    lootList.sort((a, b) => {
      const nameA = a.name.toUpperCase(); // ignore upper and lowercase
      const nameB = b.name.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // names must be equal
      return 0;
    });
    // Set Salelist IDs
    for (let i = 0; i < lootList.length; i++) {
      this.saleList[lootList[i].id].lootlistID = i;
    }
    return lootList;
  }
  /**
  * Sets the lootlist to the current sale list
  */
  setLootListToSaleList() {
    this.saleList.forEach((item) => {
      if (item.lootlistID != -1) {
        this.lootList[item.lootlistID].sell = item.sell;
      }
    });
  }
  /**
  * Sets the salelist to the loot list
  */
  setSaleListToLootList() {
    this.lootList.forEach((item) => {
      this.saleList[item.id].sell = item.sell;
    });
  }
  /**
  * Prints out the current loot list to the console
  */
  printLootList() {
    let outStr = 'ID\tName\tSell\n';
    this.lootList.forEach((item) => {
      outStr += `${item.id}\t${item.name}\t${item.sell}\n`;
    });
    console.log(outStr);
  }
  /**
  * Sets the sale list to the default setting of combat uniques
  */
  setSaleListToDefault() {
    for (let i = 0; i < this.saleList.length; i++) {
      this.saleList[i].sell = true;
    }
    this.defaultSaleKeep.forEach((itemID) => {
      this.saleList[itemID].sell = false;
    });
  }
  /**
  * Sets the loot list to sell only items that have been discovered by the player
  */
  setLootListToDiscovered() {
    for (let i = 0; i < itemStats.length; i++) {
      if (this.saleList[i].onLootList) {
        this.lootList[this.saleList[i].lootlistID].sell = (itemStats[i].timesFound > 0);
      }
    }
  }
  /**
  * Sets the loot list to default settings
  */
  setLootListToDefault() {
    for (let i = 0; i < this.lootList.length; i++) {
      this.lootList[i].sell = true;
    }
    this.defaultSaleKeep.forEach((itemID) => {
      if (this.saleList[itemID].onLootList) {
        this.lootList[this.saleList[itemID].lootlistID].sell = false;
      }
    });
  }
  /**
  * Computes the value of the contents of a chest respecting the loot sell settings
  * @param {number} chestID
  * @return {number}
  */
  computeChestOpenValue(chestID) {
    if (this.sellLoot != 'None') {
      let gpWeight = 0;
      let totWeight = 0;
      let avgQty;
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
  * Computes the average amount of GP earned when killing a monster, respecting the loot sell settings
  * @param {number} monsterID
  * @return {number}
  */
  computeMonsterValue(monsterID) {
    let monsterValue = 0;
    monsterValue += this.computeAverageCoins(monsterID);
    monsterValue += this.computeDropTableValue(monsterID);
    if (this.currentSim.canTopazDrop && this.shouldSell(CONSTANTS.item.Signet_Ring_Half_B)) {
      monsterValue += items[CONSTANTS.item.Signet_Ring_Half_B].sellsFor * this.getMonsterCombatLevel(monsterID) / 500000;
    }
    monsterValue *= this.computeLootChance(monsterID);
    if (this.sellBones && !this.currentSim.doBonesAutoBury) {
      monsterValue += items[MONSTERS[monsterID].bones].sellsFor * this.currentSim.lootBonus * ((MONSTERS[monsterID].boneQty) ? MONSTERS[monsterID].boneQty : 1);
    }
    return monsterValue;
  }

  /**
   * Computes the average amount of potional herblore xp from killing a monster
   * @param {number} monsterID Index of MONSTERS
   * @param {number} convertChance The chance to convert seeds into herbs
   * @return {number}
   */
  computeMonsterHerbXP(monsterID, convertChance) {
    let herbWeight = 0;
    let totalWeight = 0;
    for (let i = 0; i < MONSTERS[monsterID].lootTable.length; i++) {
      const itemID = MONSTERS[monsterID].lootTable[i][0];
      if (items[itemID].tier === 'Herb' && items[itemID].type === 'Seeds') {
        const avgQty = (1 + MONSTERS[monsterID].lootTable[i][2]) / 2 + 3;
        herbWeight += MONSTERS[monsterID].lootTable[i][1] * this.xpPerHerb[itemID] * convertChance * avgQty;
      }
      totalWeight += MONSTERS[monsterID].lootTable[i][1];
    }
    return herbWeight / totalWeight * this.computeLootChance(monsterID) * this.currentSim.lootBonus;
  }
  /**
  * Computes the average amount of GP earned when completing a dungeon, respecting the loot sell settings
  * @param {number} dungeonID
  * @return {number}
  */
  computeDungeonValue(dungeonID) {
    let dungeonValue = 0;
    if (this.sellLoot != 'None') {
      DUNGEONS[dungeonID].rewards.forEach((reward) => {
        if (items[reward].canOpen) {
          dungeonValue += this.computeChestOpenValue(reward) * this.currentSim.lootBonus;
        } else {
          if (this.sellLoot == 'All') {
            dungeonValue += items[reward].sellsFor;
          } else {
            dungeonValue += ((this.shouldSell(reward)) ? items[reward].sellsFor : 0);
          }
        }
      });
      // Shards
      if (godDungeonID.includes(dungeonID)) {
        let shardCount = 0;
        const shardID = MONSTERS[this.condensedDungeonMonsters[dungeonID][0].id].bones;
        this.condensedDungeonMonsters[dungeonID].forEach((monster) => {
          const shardQty = (MONSTERS[monster.id].boneQty) ? MONSTERS[monster.id].boneQty : 1;
          shardCount += shardQty;
        });
        shardCount *= this.currentSim.lootBonus;
        if (this.convertShards) {
          const chestID = items[shardID].trimmedItemID;
          dungeonValue += shardCount / items[chestID].itemsRequired[0][1] * this.computeChestOpenValue(chestID);
        } else {
          dungeonValue += (this.shouldSell(shardID)) ? shardCount * items[shardID].sellsFor : 0;
        }
      }
    }
    if (this.currentSim.canTopazDrop && this.shouldSell(CONSTANTS.item.Signet_Ring_Half_B)) {
      dungeonValue += items[CONSTANTS.item.Signet_Ring_Half_B].sellsFor * this.getMonsterCombatLevel(DUNGEONS[dungeonID].monsters[DUNGEONS[dungeonID].monsters.length - 1]) / 500000;
    }
    dungeonValue += this.computeAverageCoins(DUNGEONS[dungeonID].monsters[DUNGEONS[dungeonID].monsters.length - 1]);
    return dungeonValue;
  }
  /**
  * Computes the gp/kill and gp/s data for monsters and dungeons and sets those values.
  */
  updateGPData() {
    // Set data for monsters in combat zones
    if (this.parent.isViewingDungeon) {
      this.condensedDungeonMonsters[this.parent.viewedDungeonID].forEach((monster) => {
        if (this.monsterSimData[monster.id].simSuccess) {
          this.monsterSimData[monster.id].gpPerKill = this.monsterSimData[monster.id].gpFromDamage;
          if (godDungeonID.includes(this.parent.viewedDungeonID)) {
            const boneQty = (MONSTERS[monster.id].boneQty !== undefined) ? MONSTERS[monster.id].boneQty : 1;
            const shardID = MONSTERS[monster.id].bones;
            if (this.convertShards) {
              const chestID = items[shardID].trimmedItemID;
              this.monsterSimData[monster.id].gpPerKill += boneQty * this.currentSim.lootBonus / items[chestID].itemsRequired[0][1] * this.computeChestOpenValue(chestID);
            } else if (this.shouldSell(shardID)) {
              this.monsterSimData[monster.id].gpPerKill += items[shardID].sellsFor * this.currentSim.lootBonus * boneQty;
            }
          }
          this.monsterSimData[monster.id].gpPerSecond = this.monsterSimData[monster.id].gpPerKill / this.monsterSimData[monster.id].killTimeS;
        } else {
          this.monsterSimData[monster.id].gpPerKill = 0;
          this.monsterSimData[monster.id].gpPerSecond = 0;
        }
      });
    } else {
      combatAreas.forEach((area) => {
        area.monsters.forEach((monster) => {
          if (this.monsterSimData[monster].simSuccess) {
            this.monsterSimData[monster].gpPerKill = this.computeMonsterValue(monster) + this.monsterSimData[monster].gpFromDamage;
            this.monsterSimData[monster].gpPerSecond = this.monsterSimData[monster].gpPerKill / this.monsterSimData[monster].killTimeS;
          } else {
            this.monsterSimData[monster].gpPerKill = 0;
            this.monsterSimData[monster].gpPerSecond = 0;
          }
        });
      });
      slayerAreas.forEach((area) => {
        area.monsters.forEach((monster) => {
          if (this.monsterSimData[monster].simSuccess) {
            this.monsterSimData[monster].gpPerKill = this.computeMonsterValue(monster) + this.monsterSimData[monster].gpFromDamage;
            this.monsterSimData[monster].gpPerSecond = this.monsterSimData[monster].gpPerKill / this.monsterSimData[monster].killTimeS;
          } else {
            this.monsterSimData[monster].gpPerKill = 0;
            this.monsterSimData[monster].gpPerSecond = 0;
          }
        });
      });
      // Set data for dungeons
      for (let i = 0; i < DUNGEONS.length; i++) {
        if (this.dungeonSimData[i].simSuccess) {
          this.dungeonSimData[i].gpPerKill = this.computeDungeonValue(i) + this.dungeonSimData[i].gpFromDamage;
          this.dungeonSimData[i].gpPerSecond = this.dungeonSimData[i].gpPerKill / this.dungeonSimData[i].killTimeS;
        } else {
          this.dungeonSimData[i].gpPerKill = 0;
          this.dungeonSimData[i].gpPerSecond = 0;
        }
      }
    }
  }
  /**
   * Updates the potential herblore xp for all monsters
   */
  updateHerbloreXP() {
    if (this.parent.isViewingDungeon) {
      this.condensedDungeonMonsters[this.parent.viewedDungeonID].forEach((monster) => {
        this.monsterSimData[monster.id].herbloreXPPerSecond = 0;
      });
    } else {
      // Set data for monsters in combat zones
      combatAreas.forEach((area) => {
        area.monsters.forEach((monster) => {
          if (this.monsterSimData[monster].simSuccess) {
            this.monsterSimData[monster].herbloreXPPerSecond = this.computeMonsterHerbXP(monster, this.currentSim.herbConvertChance) / this.monsterSimData[monster].killTimeS;
          } else {
            this.monsterSimData[monster].herbloreXPPerSecond = 0;
          }
        });
      });
      slayerAreas.forEach((area) => {
        area.monsters.forEach((monster) => {
          if (this.monsterSimData[monster].simSuccess) {
            this.monsterSimData[monster].herbloreXPPerSecond = this.computeMonsterHerbXP(monster, this.currentSim.herbConvertChance) / this.monsterSimData[monster].killTimeS;
          } else {
            this.monsterSimData[monster].herbloreXPPerSecond = 0;
          }
        });
      });
    }
  }
  /**
   * Updates the amount of slayer xp earned when killing monsters
   */
  updateSlayerXP() {
    if (this.parent.isViewingDungeon) {
      this.condensedDungeonMonsters[this.parent.viewedDungeonID].forEach((monster) => {
        this.monsterSimData[monster.id].slayerXpPerSecond = 0;
      });
    } else {
      // Set data for monsters in combat zones
      combatAreas.forEach((area) => {
        area.monsters.forEach((monster) => {
          if (this.monsterSimData[monster].simSuccess) {
            let monsterXP = 0;
            monsterXP += Math.floor(((MONSTERS[monster].slayerXP != undefined) ? MONSTERS[monster].slayerXP : 0) * (1 + this.currentSim.slayerXPBonus / 100));
            if (this.isSlayerTask) {
              monsterXP += Math.floor(MONSTERS[monster].hitpoints * (1 + this.currentSim.slayerXPBonus / 100));
            }
            this.monsterSimData[monster].slayerXpPerSecond = monsterXP / this.monsterSimData[monster].killTimeS;
          } else {
            this.monsterSimData[monster].slayerXpPerSecond = 0;
          }
        });
      });
      slayerAreas.forEach((area) => {
        area.monsters.forEach((monster) => {
          if (this.monsterSimData[monster].simSuccess) {
            let monsterXP = 0;
            monsterXP += Math.floor(((MONSTERS[monster].slayerXP != undefined) ? MONSTERS[monster].slayerXP : 0) * (1 + this.currentSim.slayerXPBonus / 100));
            if (this.isSlayerTask) {
              monsterXP += Math.floor(MONSTERS[monster].hitpoints * (1 + this.currentSim.slayerXPBonus / 100));
            }
            this.monsterSimData[monster].slayerXpPerSecond = monsterXP / this.monsterSimData[monster].killTimeS;
          } else {
            this.monsterSimData[monster].slayerXpPerSecond = 0;
          }
        });
      });
    }
  }
  /**
   * Updates the chance to recieve signet when killing monsters
   */
  updateSignetChance() {
    if (this.parent.isViewingDungeon) {
      this.condensedDungeonMonsters[this.parent.viewedDungeonID].forEach((monster) => {
        this.monsterSimData[monster.id].signetChance = 0;
      });
    } else {
      // Set data for monsters in combat zones
      combatAreas.forEach((area) => {
        area.monsters.forEach((monster) => {
          if (this.currentSim.canTopazDrop && this.monsterSimData[monster].simSuccess) {
            this.monsterSimData[monster].signetChance = (1 - Math.pow(1 - this.getSignetDropRate(monster), Math.floor(this.signetFarmTime * 3600 / this.monsterSimData[monster].killTimeS))) * 100;
          } else {
            this.monsterSimData[monster].signetChance = 0;
          }
        });
      });
      slayerAreas.forEach((area) => {
        area.monsters.forEach((monster) => {
          if (this.currentSim.canTopazDrop && this.monsterSimData[monster].simSuccess) {
            this.monsterSimData[monster].signetChance = (1 - Math.pow(1 - this.getSignetDropRate(monster), Math.floor(this.signetFarmTime * 3600 / this.monsterSimData[monster].killTimeS))) * 100;
          } else {
            this.monsterSimData[monster].signetChance = 0;
          }
        });
      });
      for (let i = 0; i < DUNGEONS.length; i++) {
        if (this.currentSim.canTopazDrop && this.dungeonSimData[i].simSuccess) {
          const monster = DUNGEONS[i].monsters[DUNGEONS[i].monsters.length - 1];
          this.dungeonSimData[i].signetChance = (1 - Math.pow(1 - this.getSignetDropRate(monster), Math.floor(this.signetFarmTime * 3600 / this.dungeonSimData[i].killTimeS))) * 100;
        } else {
          this.dungeonSimData[i].signetChance = 0;
        }
      }
    }
  }
  /**
   * Calculates the drop chance of a signet half from a monster
   * @param {number} monsterID The index of MONSTERS
   * @return {number}
   */
  getSignetDropRate(monsterID) {
    return this.getMonsterCombatLevel(monsterID) * this.computeLootChance(monsterID) / 500000;
  }
  /**
   * Calculates the combat level of a monster
   * @param {number} monsterID The index of MONSTERS
   * @return {number}
   */
  getMonsterCombatLevel(monsterID) {
    const prayer = 1;
    const base = 0.25 * (MONSTERS[monsterID].defenceLevel + MONSTERS[monsterID].hitpoints + Math.floor(prayer / 2));
    const melee = 0.325 * (MONSTERS[monsterID].attackLevel + MONSTERS[monsterID].strengthLevel);
    const range = 0.325 * (Math.floor(3 * MONSTERS[monsterID].rangedLevel / 2));
    const magic = 0.325 * (Math.floor(3 * MONSTERS[monsterID].magicLevel / 2));
    const levels = [melee, range, magic];
    return Math.floor(base + Math.max(...levels));
  }
}

/**
 * Class for the cards in the bottom of the ui
 */
class McsCard {
  /**
   * Constructs an instance of McsCard
   * @param {HTMLElement} parentElement The parent element the card should be appended to
   * @param {string} width The width of the card
   * @param {string} height The height of the card
   * @param {string} inputWidth The width of inputs for the card's ui elements
   */
  constructor(parentElement, width, height, inputWidth) {
    this.container = document.createElement('div');
    this.container.className = 'mcsCardContainer';
    this.container.style.minWidth = width;
    if (height !== '') {
      this.container.style.height = height;
    }
    parentElement.appendChild(this.container);
    this.inputWidth = inputWidth;
    this.dropDowns = [];
    this.buttons = [];
    this.numOutputs = [];
  }
  /**
   * Sets the container width to the max, only works while none have display=none
   * @memberof McsCard
   */
  setContainerWidths() {
    const maxWidth = Math.max(...[...this.container.getElementsByClassName('mcsCCContainer')].map((container)=>{
      return container.offsetWidth;
    }));
    [...this.container.getElementsByClassName('mcsCCContainer')].forEach((container)=>{
      container.style.width = `${maxWidth}px`;
    });
  }
  /**
  * Creates a new button and appends it to the container. Autoadds callbacks to change colour
  * @param {string} buttonText Text to display on button
  * @param {Function} onclickCallback Callback to excute when pressed
  * @param {number} width Width of button in px
  * @param {number} height Height of button in px
  */
  addButton(buttonText, onclickCallback, width, height) {
    const newButton = document.createElement('button');
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
  * Creates a new button with the image
  * @param {string} imageSource Source of the image on the button
  * @param {string} idText Text to put in the id of the button
  * @param {Function} onclickCallback Callback when clicking the button
  * @param {number} width Width of the button and image in px
  * @param {number} height Height of the button and image in px
  * @param {HTMLElement} tooltip
  * @return {HTMLButtonElement} The created button element
  */
  createImageButton(imageSource, idText, onclickCallback, width, height, tooltip) {
    const newButton = document.createElement('button');
    newButton.type = 'button';
    newButton.id = `MCS ${idText} Button`;
    newButton.className = 'mcsImageButton';
    newButton.onclick = onclickCallback;
    const newImage = document.createElement('img');
    newImage.className = 'mcsButtonImage';
    newImage.id = `MCS ${idText} Button Image`;
    newImage.src = imageSource;
    newImage.width = width;
    newImage.height = height;
    newButton.appendChild(newImage);
    return newButton;
  }
  /**
   * Creates multiple image button in an array
   * @param {Array<string>} sources The image source paths
   * @param {Array<string>} idtexts The ids for the buttons
   * @param {number} height The height of the buttons in px
   * @param {number} width The width of the buttons in px
   * @param {Array<Function>} onclickCallbacks The callbacks for the buttons
   * @param {number} containerWidth container width in px
   * @return {Array<HTMLDivElement>} The tooltips of the buttons
   */
  addMultiImageButton(sources, idtexts, height, width, onclickCallbacks, containerWidth = 176) {
    const toolTips = [];
    const newCCContainer = document.createElement('div');
    newCCContainer.className = 'mcsMultiImageButtonContainer';
    for (let i = 0; i < sources.length; i++) {
      const newButton = this.createImageButton(sources[i], idtexts[i], onclickCallbacks[i], width, height);
      toolTips.push(this.addTooltip(newButton));
      newCCContainer.appendChild(newButton);
    }
    newCCContainer.style.width = `${containerWidth}px`;
    this.container.appendChild(newCCContainer);
    return toolTips;
  }
  /**
   * Assigns the onclick event to a popupmenu
   * @param {HTMLElement} showElement Element that should show the popup when clicked
   * @param {HTMLElement} popupMenuElement Element that should be displayed when the showElement is clicked
   */
  registerPopupMenu(showElement, popupMenuElement) {
    showElement.addEventListener('click', ()=>{
      let firstClick = true;
      if (popupMenuElement.style.display === 'none') {
        const outsideClickListener = (event)=>{
          if (firstClick) {
            firstClick = false;
            return;
          }
          if (!popupMenuElement.contains(event.target) && popupMenuElement.style.display === '') {
            popupMenuElement.style.display = 'none';
            document.body.removeEventListener('click', outsideClickListener);
          }
        };
        document.body.addEventListener('click', outsideClickListener);
        popupMenuElement.style.display = '';
      }
    });
  }
  /**
   * Creates a multiple button popup menu (Equip grid)
   * @param {string[]} sources
   * @param {string[]} elIds
   * @param {number} height
   * @param {number} width
   * @param {HTMLElement} popups
   */
  addMultiPopupMenu(sources, elIds, height, width, popups) {
    const newCCContainer = document.createElement('div');
    newCCContainer.className = 'mcsGearImageContainer';
    for (let i = 0; i < sources.length; i++) {
      const containerDiv = document.createElement('div');
      containerDiv.style.position = 'relative';
      const newImage = document.createElement('img');
      newImage.style.width = `${width}px`;
      newImage.style.height = `${height}px`;
      newImage.id = `${elIds[i]}`;
      newImage.src = sources[i];
      newImage.className = 'mcsPopupImage border border-2x border-rounded-equip border-combat-outline';
      containerDiv.appendChild(newImage);
      containerDiv.appendChild(popups[i]);
      newCCContainer.appendChild(containerDiv);
      popups[i].style.display = 'none';
      this.registerPopupMenu(containerDiv, popups[i]);
    }
    this.container.appendChild(newCCContainer);
  }
  /**
  * Adds a dropdown to the card
  * @param {string} labelText The text to label the dropdown with
  * @param {Array<string>} optionText The text of the dropdown's options
  * @param {Array} optionValues The values of the dropdown's options
  * @param {number} height The height of the dropdown
  * @param {Function} onChangeCallback The callback for when the option is changed
  */
  addDropdown(labelText, optionText, optionValues, height, onChangeCallback) {
    const dropDownID = `MCS ${labelText} Dropdown`;
    const newCCContainer = this.createCCContainer(height);
    newCCContainer.id = `${dropDownID} Container`;
    newCCContainer.appendChild(this.createLabel(labelText, dropDownID));
    const newDropdown = this.createDropdown(optionText, optionValues, dropDownID, onChangeCallback);
    newCCContainer.appendChild(newDropdown);
    this.container.appendChild(newCCContainer);
  }
  /**
   * Adds a dropdown to the card, but also returns a reference to it
   * @param {Array<string>} optionText The text of the dropdown's options
   * @param {Array} optionValues The values of the dropdown's options
   * @param {string} dropDownID The id of the dropdown
   * @param {Function} onChangeCallback The callback for when the option is changed
   * @return {HTMLSelectElement}
   */
  createDropdown(optionText, optionValues, dropDownID, onChangeCallback) {
    const newDropdown = document.createElement('select');
    newDropdown.className = 'mcsDropdown';
    newDropdown.style.width = this.inputWidth;
    newDropdown.id = dropDownID;
    for (let i = 0; i < optionText.length; i++) {
      const newOption = document.createElement('option');
      newOption.text = optionText[i];
      newOption.value = optionValues[i];
      newOption.className = 'mcsOption';
      newDropdown.add(newOption);
    }
    newDropdown.addEventListener('change', onChangeCallback);
    this.dropDowns.push(newDropdown);
    return newDropdown;
  }
  /**
   * Adds an input to the card for a number
   * @param {string} labelText The text for the input's label
   * @param {number} startValue The initial value
   * @param {number} height The height of the input in pixels
   * @param {number} min The minimum value of the input
   * @param {number} max The maximum value of the input
   * @param {Function} onChangeCallback The callback for when the input changes
   */
  addNumberInput(labelText, startValue, height, min, max, onChangeCallback) {
    const inputID = `MCS ${labelText} Input`;
    const newCCContainer = this.createCCContainer(height);
    newCCContainer.appendChild(this.createLabel(labelText, inputID));
    const newInput = document.createElement('input');
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
  /**
   * Adds an input to the card for text
   * @param {string} labelText The text for the input's label
   * @param {string} startValue The iniial text in the input
   * @param {number} height The height of the input in pixels
   * @param {Function} onInputCallback The callback for when the input changes
   */
  addTextInput(labelText, startValue, height, onInputCallback) {
    const inputID = `MCS ${labelText} TextInput`;
    const newCCContainer = this.createCCContainer(height);
    newCCContainer.appendChild(this.createLabel(labelText, inputID));
    const newInput = document.createElement('input');
    newInput.id = inputID;
    newInput.type = 'text';
    newInput.value = startValue;
    newInput.className = 'mcsTextInput';
    newInput.style.width = this.inputWidth;
    newInput.addEventListener('input', onInputCallback);
    newCCContainer.appendChild(newInput);
    this.container.appendChild(newCCContainer);
  }
  /**
   * Adds a number output to the card
   * @param {string} labelText The text for the output's label
   * @param {string} initialValue The intial text of the output
   * @param {number} height The height of the output in pixels
   * @param {string} imageSrc An optional source for an image, if left as '', an image will not be added
   * @param {string} outputID The id of the output field
   * @param {boolean} setLabelID Whether or not to assign an ID to the label
   */
  addNumberOutput(labelText, initialValue, height, imageSrc, outputID, setLabelID = false) {
    if (!outputID) {
      outputID = `MCS ${labelText} Output`;
    }
    const newCCContainer = this.createCCContainer(height);
    if (imageSrc && imageSrc != '') {
      newCCContainer.appendChild(this.createImage(imageSrc, height));
    }
    const newLabel = this.createLabel(labelText, outputID, setLabelID);
    if (setLabelID) {
      newLabel.id = `MCS ${labelText} Label`;
    }
    newCCContainer.appendChild(newLabel);
    const newOutput = document.createElement('span');
    newOutput.className = 'mcsNumberOutput';
    newOutput.style.width = this.inputWidth;
    newOutput.textContent = initialValue;
    newOutput.id = outputID;
    newCCContainer.appendChild(newOutput);

    this.container.appendChild(newCCContainer);
    this.numOutputs.push(newOutput);
  }
  /**
   * Adds a title to the card
   * @param {string} titleText The text for the title
   * @param {string} titleID An optional id for the title, if left as '' an ID will not be assigned
   */
  addSectionTitle(titleText, titleID) {
    const newSectionTitle = document.createElement('div');
    if (titleID) {
      newSectionTitle.id = titleID;
    }
    newSectionTitle.textContent = titleText;
    newSectionTitle.className = 'mcsSectionTitle';
    this.container.appendChild(newSectionTitle);
  }
  /**
   * Adds an array of buttons to the card
   * @param {Array<string>} buttonText The text to put on the buttons
   * @param {number} height The height of the buttons in pixels
   * @param {number} width The width of the buttons in pixels
   * @param {Array<Function>} buttonCallbacks The callback function for when the buttons are clicked
   */
  addMultiButton(buttonText, height, width, buttonCallbacks) {
    let newButton;
    const newCCContainer = document.createElement('div');
    newCCContainer.className = 'mcsMultiButtonContainer';
    newCCContainer.style.height = `${height}px`;
    for (let i = 0; i < buttonText.length; i++) {
      newButton = document.createElement('button');
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
  /**
   * Adds a radio option to the card
   * @param {string} labelText The text for the option's label
   * @param {number} height The height of the radios in pixels
   * @param {string} radioName The name of the radio
   * @param {Array<string>} radioLabels The labels for the individual radio buttons
   * @param {Array<Function>} radioCallbacks The callbacks for the individual radio buttons
   * @param {number} initialRadio The intial radio that is on
   * @param {string} imageSrc An optional string to specify the source of a label image, if '' an image is not added
   */
  addRadio(labelText, height, radioName, radioLabels, radioCallbacks, initialRadio, imageSrc) {
    const newCCContainer = this.createCCContainer(height);
    if (imageSrc && imageSrc != '') {
      newCCContainer.appendChild(this.createImage(imageSrc, height));
    }
    newCCContainer.appendChild(this.createLabel(labelText, ''));
    newCCContainer.id = `MCS ${labelText} Radio Container`;
    const radioContainer = document.createElement('div');
    radioContainer.className = 'mcsRadioContainer';
    radioContainer.style.width = this.inputWidth;
    newCCContainer.appendChild(radioContainer);
    // Create Radio elements with labels
    for (let i = 0; i < radioLabels.length; i++) {
      radioContainer.appendChild(this.createRadio(radioName, radioLabels[i], `MCS ${labelText} Radio ${radioLabels[i]}`, initialRadio == i, radioCallbacks[i]));
    }
    this.container.appendChild(newCCContainer);
  }
  /**
   * Creates a radio input element
   * @param {string} radioName The name of the radio collection
   * @param {string} radioLabel The text of the radio
   * @param {string} radioID The id of the radio
   * @param {boolean} checked If the radio is checked or not
   * @param {Function} radioCallback Callback for when the radio is clicked
   * @return {HTMLDivElement}
   */
  createRadio(radioName, radioLabel, radioID, checked, radioCallback) {
    const newDiv = document.createElement('div');
    newDiv.appendChild(this.createLabel(radioLabel, radioID));
    const newRadio = document.createElement('input');
    newRadio.type = 'radio';
    newRadio.id = radioID;
    newRadio.name = radioName;
    if (checked) {
      newRadio.checked = true;
    }
    newRadio.addEventListener('change', radioCallback);
    newDiv.appendChild(newRadio);
    return newDiv;
  }

  /**
   * Creates a Card Container Container div
   * @param {number} height The height of the container in pixels
   * @return {HTMLDivElement}
   */
  createCCContainer(height) {
    const newCCContainer = document.createElement('div');
    newCCContainer.className = 'mcsCCContainer';
    newCCContainer.style.height = `${height}px`;
    const fillerDiv = document.createElement('div');
    fillerDiv.className = 'mcsFlexFiller';
    newCCContainer.appendChild(fillerDiv);
    return newCCContainer;
  }
  /**
   * Creates a label element
   * @param {string} labelText The text of the label
   * @param {string} referenceID The element the label references
   * @return {HTMLLabelElement}
   */
  createLabel(labelText, referenceID) {
    const newLabel = document.createElement('label');
    newLabel.className = 'mcsLabel';
    newLabel.textContent = labelText;
    newLabel.for = referenceID;
    return newLabel;
  }
  /**
  * Creates an image element
  * @param {string} imageSrc source of image
  * @param {number} height in pixels
  * @return {HTMLImageElement} The newly created image element
  */
  createImage(imageSrc, height) {
    const newImage = document.createElement('img');
    newImage.style.height = `${height}px`;
    newImage.src = imageSrc;
    return newImage;
  }
  /**
   * Adds a tooltip to an element
   * @param {HTMLElement} parent The parent element to attach the tooltip to
   * @return {HTMLDivElement} The newly created tooltip
   */
  addTooltip(parent) {
    const newTooltip = document.createElement('div');
    newTooltip.className = 'mcsTooltip';
    newTooltip.style.display = 'none';
    parent.addEventListener('mouseenter', (e) => this.showTooltip(e, newTooltip));
    parent.addEventListener('mouseleave', (e) => this.hideTooltip(e, newTooltip));
    parent.appendChild(newTooltip);
    return newTooltip;
  }
  // Prebaked functions for tooltips
  /**
   * Toggles the display of a tooltip off
   * @param {MouseEvent} e The mouseleave event
   * @param {HTMLDivElement} tooltip The tooltip element
   */
  hideTooltip(e, tooltip) {
    tooltip.style.display = 'none';
  }
  /**
   * Toggles the display of a tooltip on
   * @param {MouseEvent} e The mouseenter event
   * @param {HTMLDivElement} tooltip The tooltip element
   */
  showTooltip(e, tooltip) {
    tooltip.style.display = '';
  }
}
/**
 * @description Formats a number with the specified number of sigfigs, Addings suffixes as required
 * @param {number} numberToFormat Number
 * @param {number} numDigits Number of significant digits
 * @return {string}
 */
function mcsFormatNum(numberToFormat, numDigits) {
  let outStr;
  let magnitude = 0;
  if (numberToFormat != 0) {
    magnitude = Math.floor(Math.log10(numberToFormat));
  }
  if (magnitude < numDigits) {
    let numDecimals = numDigits - magnitude - 1;
    if (numDecimals + 1 > numDigits) {
      numDecimals = numDigits - 1;
    };
    outStr = (numberToFormat).toFixed(numDecimals);
  } else {
    const threeMag = Math.floor(magnitude / 3);
    const formatEnd = ['k', 'M', 'B', 'T'];
    if (formatEnd.length >= threeMag) {
      outStr = (numberToFormat / Math.pow(10, threeMag * 3)).toFixed(numDigits - (magnitude - 3 * threeMag) - 1) + formatEnd[threeMag - 1];
    } else {
      outStr = (numberToFormat / Math.pow(10, threeMag * 3)).toFixed(numDigits - (magnitude - 3 * threeMag) - 1) + `e${3 * threeMag}`;
    }
  }
  // Go Forward in string until decimal is found (or not);
  let decInd;
  for (i = 0; i < outStr.length; i++) {
    if (outStr.charAt(i) == '.') {
      decInd = i;
      break;
    }
  }
  if (decInd == undefined) {
    decInd = outStr.length;
  }
  // Move backwards in the string and insert commas
  let commaCount = 0;
  for (let i = decInd; i > 1; i--) {
    commaCount++;
    if (commaCount == 3) {
      outStr = outStr.slice(0, i - 1) + ',' + outStr.slice(i - 1);
      commaCount = 0;
    }
  }
  return outStr;
}
// Define the message listeners from the content script
window.addEventListener('message', (event) => {
  // We only accept messages from ourselves
  if (event.source != window) {
    return;
  }
  if (event.data.type && (event.data.type == 'MCS_FROM_CONTENT')) {
    // console.log('Message recieved from content script');
    switch (event.data.action) {
      case 'RECIEVE_URLS':
        // console.log('Loading sim with provided URLS');
        let tryLoad = true;
        let wrongVersion = false;
        if (gameVersion != 'Alpha v0.15.4') {
          wrongVersion = true;
          tryLoad = window.confirm('Melvor Combat Simulator\nA different game version was detected. Loading the combat sim may cause unexpected behaviour or result in inaccurate simulation results.\n Try loading it anyways?');
        }
        if (tryLoad) {
          try {
            melvorCombatSim = new McsApp(event.data.urls);
            if (wrongVersion) {
              console.log('Melvor Combat Sim v0.9.1 Loaded, but simulation results may be inaccurate.');
            } else {
              console.log('Melvor Combat Sim v0.9.1 Loaded');
            }
          } catch (error) {
            console.warn('Melvor Combat Sim was not properly loaded due to the following error:');
            console.error(error);
          }
        } else {
          console.warn('Melvor Combat Sim was not Loaded due to game version incompatability.');
        }
        break;
    }
  }
}, false);
// Wait for page to finish loading, then create an instance of the combat sim
let melvorCombatSim;
if (typeof isLoaded !== 'undefined') {
  const melvorCombatSimLoader = setInterval(() => {
    if (isLoaded) {
      clearInterval(melvorCombatSimLoader);
      window.postMessage({type: 'MCS_FROM_PAGE', action: 'REQUEST_URLS'});
    }
  }, 200);
}
