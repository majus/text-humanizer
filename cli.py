import sys
from stealthhumanizer.core import humanize, score_text


def main():
    print("StealthHumanizer CLI")

    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])

        output = humanize(text)
        score = score_text(output)

        print("\nInput:", text)
        print("\nOutput:", output)
        print("\nScores:", score)

    else:
        print("Usage: python cli.py <text>")


if __name__ == "__main__":
    main()
