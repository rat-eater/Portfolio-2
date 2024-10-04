Summarized Changes:

1. Converting the player input
I fixed the input move so the player can insert their character in row and column starting from 1 instead of 0
The board however still requires the 0-based index to function.

2. Move Validation
With the isValidPositionOnBoard(position) function, this checks if the position falls within inside the game board. But since inside the code the position is still 0-based, the conditions check against 0 and 2 for the 3x3 board.
I also used the ANSI colors to differentiate between X and O.

3. Game Board Display
When the board is shown, I tried to ensure that the coordinates displayed to the player reflect the 1-based indexing. Basically this means that the game board should be printed with rows and columns starting from 1 instead of 0.

4. Menu functionality
I created an object called MENU_CHOICES to store the menu options with proper names. This also removes magic numbers (like 1 and 2) and improves readability.
I kept running into bugs however, so I had to ensure the validation of the choices made. Basically I tried to prevent invalid input from being processed, which often resulted in the game disappearing.

6. Settings Menu and Language
I structured the settings menu where you can now change the language from English to Romanian.

7. Game Improvements
For the PvC mode, I used something very plain that has the computer fill the first empty space it finds. It's a simple loop that loses its magic after you figure out what it does.

8. Game Evaluation
For the Diagonal Win, I used help from classmates (Daniel G. and Hieu). I needed help explaining the result of the sum and the use of the Math.abs command thingie.

9. Splashart changes
I added colors to the graphic using the ANSI file given.

