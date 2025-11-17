from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:1234/v1",
    api_key="unused"  
)

response = client.chat.completions.create(
    model="openai/gpt-oss-20b",
    messages=[
        {"role": "user", "content": "Best Easter ehh in Minecraft!"}
    ]
)

MaxLives = 10
CurrentLives = 10

Stages = ["Heart of Forest","Forest OutSkirts","Mystical Land","Dragons Peak","Crytal beach"]
Armor = ["Defualt","Base Armor","Re-Inforced Armor","Dragons Armor"]
Weapon = ["Default Blace","Blade","Long Sword","Cursed Sword","Fiery Mace"]

PlayerInventory = []

MonsterPoolForest = [
    ["Bear", 25],
    ["Deer", 22],
    ["Villager", 19]
]


MonsterPool2 = [
    ["Knight", 30],
    ["Snake", 8]
]


MonsterPool3 = [
    ["Mystic Spirit", 14],
    ["Enchanted Wolf", 28],
    ["Forest Guardian", 45],
    ["Slime", 6]
]


MonsterPool4 = [
    ["Fire Salamander", 30],
    ["Drake Hatchling", 45],
    ["Volcanic Guardian", 90]
]


MonsterPool5 = [
    ["Tide Wraith", 45],
    ["Corrupted Crusader", 60],
    ["DEATH", 200]
]


print(response.choices[0].message.content)
