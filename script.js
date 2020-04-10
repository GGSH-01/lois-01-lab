var INPUT_ELEMENTS = [];
var GLOBAL = 'g';

const NEGATION = "!";
const CONJUNCTION = "&";
const DISJUNCTION = "|";
const IMPLICATION = "->";
const EQUIVALENCE = "~";

let countAnswer = 0;
let n = 1;

function start() {
    var input = document.getElementById("inputText").value;

    if (checkSdnf(input)) {
        alert("СДНФ");
    } else {
        alert("не СДНФ");
    }
}

function checkSdnf(input) {
    if (checkFarmulaAtom(input)) {
        return false;
    }
    
    if (checkForSingleLiteral(input)) {
        return true;
    }

    if (checkForSingleDisjunctions(input)) {
        return true;
    }
    var complexNegation = "[!][(].*[)]";
    complexNegation = new RegExp(complexNegation, GLOBAL);
    var hasNegations = input.match(complexNegation);
    if (hasNegations !== null) {
        return false
    }

    if (!checkFormulaSyntax(input)) {
        return false;
    }

    var disjunctions = input.split("|") || input;
    for (var i = 0; i < disjunctions.length; i++) {
        deleteExtraBrackets(disjunctions[i], i, disjunctions);
    }
    INPUT_ELEMENTS = getElementSetFromFormula(input);

    var allElementsUsage = disjunctions.every(checkForUsingElement);
    return allElementsUsage && !checkForDuplicatesDisjunctions(disjunctions);
}

function checkFarmulaAtom(input) {
    if (input.match(/^\([A-Z]\)$/) !== null){
       return true;
      }
}

function checkForSingleLiteral(input) {
    if (input.match(/^(\(\!)?[A-Z](\))?$/) !== null) {
        return true;
    }

   return false;
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function checkForSingleDisjunctions(input) {
    var regSingle = /^\(((\(![A-Z]\))(&)?|([A-Z])(&)?)+\)$/;
    var inputReg = input.match(regSingle);
    var literals = input.match(/[A-Z]/g);
    var unique = literals.filter( onlyUnique );

    return inputReg !== null && unique.length === literals.length;
}

function checkFormulaSyntax(input) {
    var subFormula = "A";
    var regSdnf = /(\((([A-Z])|(\(\!([A-Z])\)))(&(([A-Z])|(\(\!([A-Z])\))))*\))/
    regSdnf = new RegExp(regSdnf, GLOBAL);

    var oldFormula;
    do {
        oldFormula = input;
        input = input.replace(regSdnf, subFormula);
    } while (input !== oldFormula);
    if (input === subFormula) {
        return false;
    } else {
        return checkConjunctions(input)
    }
}

function checkConjunctions(input) {
    var subFormula = "A";
    var regSdnf = /\(([A-Z])(\|([A-Z]))*\)/

    regSdnf = new RegExp(regSdnf, GLOBAL);

    var conjunctionFormula;
    do {
        conjunctionFormula = input;
        input = input.replace(regSdnf, subFormula);
    } while (input !== conjunctionFormula);
    return (input === subFormula);
}

function deleteExtraBrackets(element, index, inputArray) {
    var closeBrackets = element.match(new RegExp("[)]", GLOBAL));
    var closeCounter = (closeBrackets === null) ? 0 : closeBrackets.length;

    var openBrackets = element.match(new RegExp("[(]", GLOBAL));
    var openCounter = (openBrackets === null) ? 0 : openBrackets.length;

    if (closeCounter > openCounter) {
        inputArray[index] = element.slice(0, element.length - (closeCounter - openCounter));
    }
    if (closeCounter < openCounter) {
        inputArray[index] = element.slice(openCounter - closeCounter);
    }
}

function getElementSetFromFormula(input) {
    var atom = "([A-Z])";
    atom = new RegExp(atom, GLOBAL);
    var results = input.match(atom) || [];
    var uniqueAtom = results.filter(function (symbol, index) {
        return results.indexOf(symbol) === index;
    });
    return uniqueAtom.sort();
}

function checkForUsingElement(element) {
    var elementAtoms = getElementSetFromFormula(element);
    if (INPUT_ELEMENTS.length === elementAtoms.length) {
        return true;
    }
    return INPUT_ELEMENTS.every(function (value, index) {
        return value === elementAtoms[index]
    })
}

function checkForDuplicatesDisjunctions(array) {
    var checkedValues = Object.create(null);
    for (var i = 0; i < array.length; i++) {
        var value = array[i];
        if (checkForElementRepeat(value) || includedInArray(value, checkedValues)) {
            return true;
        }
        checkedValues[value] = true;
    }
    return false;
}

function checkForElementRepeat(subFormula) {
    var element = "([A-Z])|([!]([A-Z]))";
    var visitedElements = Object.create(null);
    var elementsSet = subFormula.match(new RegExp(element, GLOBAL));

    for (var i = 0; i < elementsSet.length; i++) {
        var currentElement = elementsSet[i];
        if (currentElement in visitedElements) {
            return true;
        }
        visitedElements[currentElement] = true;
    }
    return false;
}

function includedInArray(disjunction, checkedValues) {
    var disjunctionSymbol = "([|])";
    var matched = false;
    for (var value in checkedValues) {
        var valueArray = String(value).split(new RegExp(disjunctionSymbol, GLOBAL));

        for (var i = 0; i < valueArray.length; i++) {
            deleteExtraBrackets(valueArray[i], i, valueArray);
        }
        valueArray.sort();

        var disjunctionArray = disjunction.split(new RegExp(disjunctionSymbol, GLOBAL));
        for (var i = 0; i < disjunctionArray.length; i++) {
            deleteExtraBrackets(disjunctionArray[i], i, disjunctionArray);
        }
        disjunctionArray.sort();

        var counter = 0;

        for (var element = 0; element < valueArray.length; element++) {
            if (getElement(valueArray[element]) === getElement(disjunctionArray[element])) {
                counter++;
            }
        }
        if (counter === valueArray.length) {
            matched = true;
        }
    }
    return matched;
}

function getElement(element) {
    var regElement = "[(]([A-Z])[)]";
    var matcher = element.match(new RegExp(regElement, GLOBAL));
    if (matcher !== null) {
        return element[1];
    } else {
        return element;
    }
}

