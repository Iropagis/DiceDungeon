
class Dice {
    constructor(faces) {
        this.faces = faces;
        this.isAvailable = true;
    }

    roll() {
        return this.faces[Math.floor(Math.random() * this.faces.length)];
    }

    reset() {
        this.isAvailable = true;
    }
}

class Monster {
    constructor(name, hp, damage, combatSequence) {
        this.name = name;
        this.hp = hp;
        this.damage = damage;
        this.combatSequence = combatSequence;
    }
}

class Hero {
    constructor(hp, inventory) {
        this.hp = hp;
        this.inventory = inventory;
    }

    attack(monster, dice) {
        const roll = dice.roll();
        const damageDealt = roll * 2; // Apply double damage
        monster.hp -= damageDealt;
        dice.isAvailable = false;
        return { roll, damageDealt };
    }

    defend(monsterDamage, dice) {
        const roll = dice.roll();
        const damageTaken = Math.abs(roll - monsterDamage);
        this.hp -= damageTaken;
        dice.isAvailable = false;
        return { roll, damageTaken };
    }

    castSpell(monster, dice) {
        const roll = dice.roll();
        if (roll === 7 || roll === 3 || roll === 11 || roll === 77) {
            monster.hp -= roll;
            this.hp += roll;
            dice.isAvailable = false;
            return { roll, effect: roll };
        } else {
            return { roll, effect: 0 };
        }
    }

    resetInventory() {
        this.inventory.forEach(dice => dice.reset());
    }
}

let hero = new Hero(100, [new Dice([1, 2, 3, 4, 5, 6])]);
let monsters = [
    new Monster("Slime", 5, 5, ["attack", "defend", "vulnerable"]),
    new Monster("Big Slime", 10, 5, ["defend", "attack", "vulnerable"]),
    new Monster("Dragon", 50, 10, ["defend", "defend", "defend", "vulnerable", "slow", "attack"]),
    // Add more monsters as needed...
];
let currentMonsterIndex = 0;
let lastActionResult = "";

function displayState() {
    document.getElementById("hero-hp").innerText = hero.hp;
    document.getElementById("hero-health-bar").innerText = "|".repeat(hero.hp);
    let monster = monsters[currentMonsterIndex];
    document.getElementById("monster-name").innerText = monster.name;
    document.getElementById("monster-hp").innerText = monster.hp;
    document.getElementById("monster-health-bar").innerText = "|".repeat(monster.hp);
    document.getElementById("action-result").innerText = lastActionResult;
    displayDice();
}

function displayDice() {
    let diceContainer = document.getElementById("dice-container");
    diceContainer.innerHTML = "";
    hero.inventory.forEach((dice, index) => {
        if (dice.isAvailable) {
            let diceButton = document.createElement("button");
            diceButton.innerText = `Dice ${index + 1}: ${dice.faces}`;
            diceButton.className = "dice";
            diceButton.onclick = () => performAction(dice);
            diceContainer.appendChild(diceButton);
        }
    });
}

function performAction(dice) {
    let monster = monsters[currentMonsterIndex];
    let action = monster.combatSequence[currentMonsterIndex % monster.combatSequence.length];
    
    switch(action) {
        case "attack":
            let { roll, damageDealt } = hero.attack(monster, dice);
            lastActionResult = `You rolled ${roll} and dealt ${damageDealt} damage.`;
            break;
        case "defend":
            let { roll: rollDefend, damageTaken } = hero.defend(monster.damage, dice);
            lastActionResult = `You rolled ${rollDefend} and took ${damageTaken} damage.`;
            break;
        case "vulnerable":
            let { roll: rollVulnerable, damageDealt: damageDealtVulnerable } = hero.attack(monster, dice);
            let doubleDamage = damageDealtVulnerable * 2;
            lastActionResult = `You rolled ${rollVulnerable} and dealt ${doubleDamage} damage.`;
            break;
        case "slow":
            let { roll: rollSpell, effect } = hero.castSpell(monster, dice);
            if (effect > 0) {
                lastActionResult = `You rolled ${rollSpell}. You dealt ${effect} damage and healed for ${effect}.`;
            } else {
                lastActionResult = `You rolled ${rollSpell}. Nothing happened.`;
            }
            break;
    }
    
    if (monster.hp <= 0) {
        lastActionResult += ` ${monster.name} is defeated!`;
        currentMonsterIndex++;
        if (currentMonsterIndex >= monsters.length) {
            lastActionResult += " You defeated all monsters!";
        } else {
            hero.resetInventory();
        }
    }
    
    displayState();
}

function nextTurn() {
    displayState();
}

displayState();
