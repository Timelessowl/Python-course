import random

class Dice:
    def __init__(self, sides):
        self.sides = sides

    def roll(self):
        return random.randint(1, self.sides)

def main():
    d20 = Dice(20)
    result = d20.roll()
    print(f"Rolled a d20: {result}")

if __name__ == "__main__":
    main()

