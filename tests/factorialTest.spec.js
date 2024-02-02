const { test, expect } = require('@playwright/test');

//Function to calculate factorial for numbers < 22
function factorial(n) {
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

//Function to calculate factorial in scientific notation for numbers >= 22
function factorialInScientificNotation(n) {
    let result = 1n; //Use BigInt for large numbers
    for (let i = 2n; i <= BigInt(n); i++) {
        result *= i;
    }
    //Convert to scientific notation with 16 decimals
    return Number(result).toExponential(16);
}

//Adjust the expected factorial string based on the actual result's decimal places
function adjustExpectedFactorial(expectedFactorial, result) {
    const resultDecimalLength = (result.split('e+')[0].split('.')[1] || '').length;

    //New logic for handling 14 decimals in the result
    if (resultDecimalLength === 14) {
        const fifteenthDigit = expectedFactorial[expectedFactorial.indexOf('.') + 15];
        const sixteenthDigit = expectedFactorial[expectedFactorial.indexOf('.') + 16];
        if (sixteenthDigit >= '5') {
            //Increment the 15th digit by 1 and truncate the rest
            let beforeRounding = expectedFactorial.substring(0, expectedFactorial.indexOf('.') + 16);
            let roundedPart = (parseInt(beforeRounding[beforeRounding.length - 1]) + 1).toString();
            expectedFactorial = beforeRounding.substring(0, beforeRounding.length - 1) + roundedPart;
        } else {
            //Simply truncate the 16th digit
            expectedFactorial = expectedFactorial.substring(0, expectedFactorial.indexOf('.') + 16);
        }
        if (fifteenthDigit >= '5' && sixteenthDigit < '5') {
            //Increment the 14th digit by 1 if the 15th is 5-9 and truncate the 15th
            let partBeforeFifteenth = expectedFactorial.substring(0, expectedFactorial.indexOf('.') + 15);
            let fourteenDigit = partBeforeFifteenth[partBeforeFifteenth.length - 2];
            let incrementedFourteen = (parseInt(fourteenDigit) + 1).toString();
            expectedFactorial = partBeforeFifteenth.substring(0, partBeforeFifteenth.length - 2) + incrementedFourteen + '0'.repeat(15 - partBeforeFifteenth.length + 2);
        } else if (fifteenthDigit < '5') {
            //Simply truncate the 15th digit if it's 0-4
            expectedFactorial = expectedFactorial.substring(0, expectedFactorial.indexOf('.') + 15);
        }
    } else if (resultDecimalLength === 15) {
        //Existing logic for 15 decimals
        const roundingDigit = expectedFactorial[expectedFactorial.indexOf('.') + 16]; //16th digit after the decimal
        if (roundingDigit >= '5') {
            //Truncate the 16th digit and increment the 15th digit by 1
            let beforeRounding = expectedFactorial.substring(0, expectedFactorial.indexOf('.') + 16);
            let afterRounding = parseInt(beforeRounding[beforeRounding.length - 1]) + 1;
            expectedFactorial = beforeRounding.substring(0, beforeRounding.length - 1) + afterRounding + expectedFactorial.substring(expectedFactorial.indexOf('.') + 17);
        } else {
            //Simply truncate the 16th digit
            expectedFactorial = expectedFactorial.substring(0, expectedFactorial.indexOf('.') + 16);
        }
    }
    //No adjustment needed for results with 16 decimals as it matches the original calculation
    return expectedFactorial;
}

test.describe('factorial calculation tests', () => {
    for (let number = 10; number <= 100; number++) {
        test(`test for number ${number}`, async ({ page }) => {
            //Navigate to the webpage
            await page.goto('http://qainterview.pythonanywhere.com/'); 

            //Enter the number in the input field
            await page.fill('#number', number.toString());

            //Click the Calculate! button
            await page.click('#getFactorial');

            //Wait for the result to be displayed
            await page.waitForSelector('#resultDiv');

            //Get the text content of the result div
            const result = await page.textContent('#resultDiv');

            //Calculate the expected factorial
            let expectedFactorial;
            if (number < 22) {
                expectedFactorial = factorial(number);
            } else {
                expectedFactorial = factorialInScientificNotation(number);
                //Adjust the expected factorial based on the actual result's decimal places
                expectedFactorial = adjustExpectedFactorial(expectedFactorial, result);
            }

            //Check if the result contains the correct factorial label and value            
            if (result.includes(`The factorial of ${number} is: ${expectedFactorial}`)) {
                console.log(`Correct: The factorial of ${number} is ${expectedFactorial}.`);
            } else {
                console.log(`Error: The factorial of ${number} is incorrect. Expected: ${expectedFactorial}, Actual: ${result}`);
            }

            expect(result).toContain(`The factorial of ${number} is: ${expectedFactorial}`);
        });
    }
});
