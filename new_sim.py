# HR Management Simulator by Jeffrey
# Inspired by ideas from Danila, Audrey, and Lyra
#
# A tkinter business-management game: keep your stats up, beat the
# competition for market share, and don't go bankrupt.

import tkinter as tk
import tkinter.messagebox as messagebox
import random
from tkinter import ttk

# ---------------- THEME ----------------
# A single source of truth for colours so the look stays consistent.
COL = {
    "bg":      "#0B1220",   # app background (deep navy)
    "panel":   "#111B2E",   # card background
    "panel2":  "#16233B",   # raised card / hover
    "line":    "#243352",   # borders
    "text":    "#E6EDF7",   # primary text
    "muted":   "#8DA0BF",   # secondary text
    "accent":  "#38BDF8",   # cyan accent
    "accent2": "#7C9CFF",   # button accent
    "good":    "#34D399",   # green
    "warn":    "#FBBF24",   # amber
    "bad":     "#F87171",   # red
    "money":   "#FCD34D",   # gold
}

FONT = "Helvetica"

# Stat metadata: key -> (label, colour-when-high)
STATS = [
    ("morale",                "Morale"),
    ("productivity",          "Productivity"),
    ("marketing",             "Marketing"),
    ("innovation",            "Innovation"),
    ("reputation",            "Reputation"),
    ("customer_satisfaction", "Customer Satisfaction"),
]

UPGRADES = {
    "Better Office":  {"cost": 10000, "desc": "Morale +10 now, slower morale decay"},
    "Automation":     {"cost": 15000, "desc": "Productivity +15 now & each month"},
    "Coffee Machine": {"cost": 5000,  "desc": "Halves morale decay"},
}

DEPARTMENTS = {
    "HR": {"cost": 8000,  "desc": "+3 Morale every month"},
    "IT": {"cost": 10000, "desc": "+3 Productivity every month"},
    "PR": {"cost": 7000,  "desc": "+3 Reputation every month"},
}

COMPANIES = {
    "Tech Startup":    "High innovation, fragile productivity",
    "Restaurant Chain":"Loyal customers, strong reputation",
    "Manufacturing":   "Productive but morale suffers",
    "Entertainment":   "Marketing & reputation powerhouse",
}

LEADERSHIP = {
    "autocratic":    "Productivity up, morale down",
    "democratic":    "Balanced morale & innovation",
    "laissez-faire": "Creative & happy, less output",
}

DIFFICULTY = {"Easy": 50, "Normal": 70, "Hard": 90}
TICK_MS = {"Slow": 4500, "Normal": 3000, "Fast": 1500}


def clamp(v, lo=0, hi=100):
    return max(lo, min(hi, v))


# ---------------- GAME STATE ----------------
class Game:
    def __init__(self):
        self.year = 1
        self.month = 1
        self.employees = 10
        self.morale = 50
        self.productivity = 50
        self.marketing = 50
        self.innovation = 50
        self.reputation = 50
        self.customer_satisfaction = 50
        self.market_share = 10.0
        self.leader_style = "democratic"
        self.competitor_market_share = 20.0
        self.money = 20000
        self.company = ""
        self.difficulty = "Normal"
        self.running = False
        self.speed = "Normal"
        self.upgrades = {k: False for k in UPGRADES}
        self.departments = {k: False for k in DEPARTMENTS}
        self.news_feed = []
        self.tick_id = None

    def target(self):
        return DIFFICULTY[self.difficulty]


game = Game()


# ---------------- ECONOMY / SIM ----------------
def calculate_profit():
    """Net monthly profit = gross revenue minus salaries."""
    morale_f = game.morale / 50
    rep_f = game.reputation / 50
    sat_f = game.customer_satisfaction / 50
    gross = (game.employees * game.productivity * 1.5) * morale_f * rep_f * sat_f
    gross += game.marketing * 4 + game.innovation * 3
    salaries = game.employees * 100
    return int(gross - salaries)


def leadership_effect():
    if game.leader_style == "autocratic":
        game.productivity = clamp(game.productivity + 4)
        game.morale = clamp(game.morale - 4)
    elif game.leader_style == "democratic":
        game.morale = clamp(game.morale + 3)
        game.innovation = clamp(game.innovation + 2)
    elif game.leader_style == "laissez-faire":
        game.morale = clamp(game.morale + 3)
        game.productivity = clamp(game.productivity - 2)
        game.innovation = clamp(game.innovation + 3)


def random_event():
    roll = random.random()
    df = {"Easy": 0.5, "Normal": 1.0, "Hard": 1.5}[game.difficulty]

    if roll < 0.45:
        return  # quiet month, most of the time

    event = random.choice([
        "strike", "lawsuit", "big_order", "competitor_attack",
        "innovation_breakthrough", "customer_complaint",
        "talent_poached", "market_boom", "economic_downturn",
    ])

    if event == "strike" and game.morale < 40:
        drop = int(15 * df)
        game.productivity = clamp(game.productivity - drop)
        add_news(f"Strike! Low morale cost {drop} productivity.", "bad")
    elif event == "lawsuit":
        loss = int(5000 * df)
        game.money -= loss
        game.reputation = clamp(game.reputation - 5)
        add_news(f"Lawsuit! Lost ${loss:,} and some reputation.", "bad")
    elif event == "big_order":
        gain = int(8000 * df)
        game.money += gain
        game.market_share = clamp(game.market_share + 2)
        add_news(f"Big order! Earned ${gain:,} and grew market share.", "good")
    elif event == "competitor_attack":
        if game.competitor_market_share > game.market_share:
            game.marketing = clamp(game.marketing - 10)
            game.reputation = clamp(game.reputation - 5)
            add_news("Competitor smear campaign hurt marketing & reputation.", "bad")
        else:
            add_news("Competitor tried to attack, but we held strong!", "good")
    elif event == "innovation_breakthrough":
        game.innovation = clamp(game.innovation + 10)
        game.reputation = clamp(game.reputation + 3)
        add_news("Innovation breakthrough! Innovation & reputation up.", "good")
    elif event == "customer_complaint":
        game.customer_satisfaction = clamp(game.customer_satisfaction - 10)
        game.reputation = clamp(game.reputation - 2)
        add_news("Customer complaints hit satisfaction & reputation.", "bad")
    elif event == "talent_poached" and game.employees > 1:
        game.employees -= 1
        game.productivity = clamp(game.productivity - 5)
        add_news("A rival poached one of your best people!", "bad")
    elif event == "market_boom":
        game.market_share = clamp(game.market_share + 3)
        game.money += 3000
        add_news("Market boom! Gained market share and cash.", "good")
    elif event == "economic_downturn":
        game.money -= 2000
        game.market_share = clamp(game.market_share - 1)
        add_news("Economic downturn dented sales.", "bad")


def apply_passive_effects():
    """Departments, upgrades and natural decay — now actually wired up."""
    # Departments give ongoing boosts (previously a no-op bug).
    if game.departments["HR"]:
        game.morale = clamp(game.morale + 3)
    if game.departments["IT"]:
        game.productivity = clamp(game.productivity + 3)
    if game.departments["PR"]:
        game.reputation = clamp(game.reputation + 3)

    # Automation upgrade gives ongoing productivity.
    if game.upgrades["Automation"]:
        game.productivity = clamp(game.productivity + 2)

    # Morale decay, reduced by Coffee Machine / Better Office.
    morale_decay = 5
    if game.upgrades["Coffee Machine"]:
        morale_decay = max(1, morale_decay // 2)
    if game.upgrades["Better Office"]:
        morale_decay = max(1, morale_decay - 1)

    game.morale = clamp(game.morale - morale_decay)
    game.customer_satisfaction = clamp(game.customer_satisfaction - 2)
    game.reputation = clamp(game.reputation - 1)


def monthly_tick():
    if not game.running:
        return

    leadership_effect()

    profit = calculate_profit()
    game.money += profit

    apply_passive_effects()

    if game.morale < 20 and game.employees > 1:
        game.employees -= 1
        add_news("Morale is dangerously low — an employee quit!", "bad")

    # Competition & market share movement.
    game.competitor_market_share = clamp(
        game.competitor_market_share + random.uniform(0.5, 2.0), 0, 100)

    growth = 0.0
    growth += (game.marketing - 50) * 0.02
    growth += (game.reputation - 50) * 0.015
    growth += (game.customer_satisfaction - 50) * 0.015
    growth += 0.5 if profit > 0 else -0.6
    growth -= 0.25  # competitors always nibble
    game.market_share = clamp(game.market_share + growth, 0, 100)

    random_event()

    # Advance calendar.
    game.month += 1
    if game.month > 12:
        game.month = 1
        game.year += 1

    update_status()
    if check_game_end():
        return

    game.tick_id = root.after(TICK_MS[game.speed], monthly_tick)


def check_game_end():
    if game.market_share >= game.target():
        finish(f"🏆 YOU WIN! Reached {game.target()}% market share in "
               f"Year {game.year}, Month {game.month}.", win=True)
        return True
    if game.money <= 0:
        finish("💸 Bankrupt! Game Over.", win=False)
        return True
    if game.employees <= 0:
        finish("🚪 Everyone quit! Game Over.", win=False)
        return True
    if game.reputation <= 0:
        finish("📉 Reputation ruined! Game Over.", win=False)
        return True
    return False


# ---------------- ACTIONS ----------------
def spend(cost):
    """Return True and deduct if affordable, else toast a warning."""
    if game.money >= cost:
        game.money -= cost
        return True
    toast("Not enough money!", "bad")
    return False


def act_training():
    if spend(5000):
        game.productivity = clamp(game.productivity + 15)
        add_news("Training day! Productivity +15.", "good")
        update_status()


def act_bonus():
    if spend(4000):
        game.morale = clamp(game.morale + 20)
        add_news("Bonuses paid! Morale +20.", "good")
        update_status()


def act_recruit():
    if spend(3000):
        game.employees += 1
        add_news("New hire joined the team! +1 employee.", "good")
        update_status()


def act_marketing():
    if spend(4000):
        game.marketing = clamp(game.marketing + 15)
        game.reputation = clamp(game.reputation + 5)
        add_news("Marketing campaign! Marketing +15, Reputation +5.", "good")
        update_status()


def act_rnd():
    if spend(6000):
        game.innovation = clamp(game.innovation + 20)
        add_news("R&D investment! Innovation +20.", "good")
        update_status()


def act_customer_service():
    if spend(2000):
        game.customer_satisfaction = clamp(game.customer_satisfaction + 15)
        game.reputation = clamp(game.reputation + 3)
        add_news("Customer service push! Satisfaction +15, Reputation +3.", "good")
        update_status()


def act_special():
    style = game.leader_style
    if style == "autocratic":
        if spend(2000):
            game.productivity = clamp(game.productivity + 10)
            game.morale = clamp(game.morale - 5)
            add_news("Forced overtime! Productivity +10, Morale -5.", "warn")
    elif style == "democratic":
        if spend(3000):
            game.morale = clamp(game.morale + 15)
            game.innovation = clamp(game.innovation + 10)
            add_news("Team-building retreat! Morale +15, Innovation +10.", "good")
    else:  # laissez-faire
        game.innovation = clamp(game.innovation + 8)
        add_news("Creative freedom day! Innovation +8 (free).", "good")
    update_status()


def cycle_leadership():
    styles = list(LEADERSHIP)
    game.leader_style = styles[(styles.index(game.leader_style) + 1) % len(styles)]
    add_news(f"Leadership style is now {game.leader_style.capitalize()}.", "warn")
    update_status()


def buy_upgrade(name):
    info = UPGRADES[name]
    if game.upgrades[name]:
        return
    if spend(info["cost"]):
        game.upgrades[name] = True
        if name == "Better Office":
            game.morale = clamp(game.morale + 10)
        elif name == "Automation":
            game.productivity = clamp(game.productivity + 15)
        add_news(f"Bought upgrade: {name}!", "good")
        refresh_shop()
        update_status()


def buy_department(name):
    info = DEPARTMENTS[name]
    if game.departments[name]:
        return
    if spend(info["cost"]):
        game.departments[name] = True
        add_news(f"Opened the {name} department!", "good")
        refresh_shop()
        update_status()


def toggle_pause():
    if not game.company:
        return
    game.running = not game.running
    if game.running:
        pause_btn.config(text="⏸  Pause")
        monthly_tick()
    else:
        pause_btn.config(text="▶  Resume")
        if game.tick_id:
            root.after_cancel(game.tick_id)


def cycle_speed():
    speeds = list(TICK_MS)
    game.speed = speeds[(speeds.index(game.speed) + 1) % len(speeds)]
    speed_btn.config(text=f"⏩  Speed: {game.speed}")


# ---------------- UI HELPERS ----------------
def styled_button(parent, text, command, kind="action"):
    palette = {
        "action": (COL["panel2"], COL["text"], COL["line"]),
        "shop":   ("#1A2942", COL["text"], COL["line"]),
        "primary":(COL["accent"], "#06121F", COL["accent"]),
    }
    bg, fg, hover_line = palette[kind]
    btn = tk.Button(
        parent, text=text, command=command,
        font=(FONT, 11, "bold" if kind == "primary" else "normal"),
        bg=bg, fg=fg, activebackground=COL["accent"], activeforeground="#06121F",
        relief="flat", bd=0, highlightthickness=1,
        highlightbackground=hover_line, cursor="hand2",
        padx=8, pady=7, anchor="w", justify="left",
    )
    hover_bg = COL["accent"] if kind == "primary" else COL["panel"]
    if kind == "primary":
        hover_bg = "#5BCBF6"

    def on_enter(_):
        if str(btn["state"]) != "disabled":
            btn.config(bg=hover_bg)

    def on_leave(_):
        if str(btn["state"]) != "disabled":
            btn.config(bg=bg)

    btn.bind("<Enter>", on_enter)
    btn.bind("<Leave>", on_leave)
    btn._base_bg = bg
    return btn


def section_label(parent, text):
    return tk.Label(parent, text=text, font=(FONT, 12, "bold"),
                    bg=COL["panel"], fg=COL["accent"], anchor="w")


def add_news(msg, tone="muted"):
    tag = {"good": COL["good"], "bad": COL["bad"], "warn": COL["warn"]}.get(tone, COL["muted"])
    game.news_feed.append((f"Y{game.year} M{game.month:>2}", msg, tag))
    if len(game.news_feed) > 40:
        game.news_feed.pop(0)
    render_news()


def render_news():
    news_box.config(state="normal")
    news_box.delete("1.0", tk.END)
    for when, msg, tag_color in reversed(game.news_feed):
        tname = f"c{tag_color}"
        if tname not in news_box.tag_names():
            news_box.tag_config(tname, foreground=tag_color)
        news_box.insert(tk.END, f"{when}  ", "stamp")
        news_box.insert(tk.END, f"{msg}\n", tname)
    news_box.config(state="disabled")


_toast_job = None


def toast(msg, tone="muted"):
    global _toast_job
    color = {"good": COL["good"], "bad": COL["bad"], "warn": COL["warn"]}.get(tone, COL["text"])
    message_var.set(msg)
    message_label.config(fg=color)
    if _toast_job:
        root.after_cancel(_toast_job)
    _toast_job = root.after(3500, lambda: message_var.set(""))


def bar_color(v):
    return COL["good"] if v > 66 else COL["warn"] if v > 33 else COL["bad"]


# ---------------- GAME SCREEN ----------------
def build_game_screen():
    global header_company, header_period, header_money, header_share
    global header_employees, header_profit, header_leader
    global stat_bars, stat_vals, news_box, message_var, message_label
    global pause_btn, speed_btn, upgrade_buttons, dept_buttons, game_frame

    game_frame = tk.Frame(root, bg=COL["bg"])

    # ---- Header bar ----
    header = tk.Frame(game_frame, bg=COL["panel"], padx=16, pady=12)
    header.pack(fill="x", padx=12, pady=(12, 6))

    header_company = tk.Label(header, text="", font=(FONT, 18, "bold"),
                              bg=COL["panel"], fg=COL["text"])
    header_company.grid(row=0, column=0, sticky="w")
    header_leader = tk.Label(header, text="", font=(FONT, 10),
                             bg=COL["panel"], fg=COL["muted"])
    header_leader.grid(row=1, column=0, sticky="w")

    def metric(col, title):
        f = tk.Frame(header, bg=COL["panel"])
        f.grid(row=0, column=col, rowspan=2, padx=14, sticky="e")
        tk.Label(f, text=title, font=(FONT, 9), bg=COL["panel"],
                 fg=COL["muted"]).pack(anchor="e")
        val = tk.Label(f, text="", font=(FONT, 15, "bold"),
                       bg=COL["panel"], fg=COL["text"])
        val.pack(anchor="e")
        return val

    header.grid_columnconfigure(0, weight=1)
    header_money = metric(1, "CASH")
    header_money.config(fg=COL["money"])
    header_profit = metric(2, "MONTHLY PROFIT")
    header_share = metric(3, "MARKET SHARE")
    header_share.config(fg=COL["accent"])
    header_employees = metric(4, "TEAM")
    header_period = metric(5, "DATE")

    # ---- Body: two columns ----
    body = tk.Frame(game_frame, bg=COL["bg"])
    body.pack(fill="both", expand=True, padx=12, pady=6)
    body.grid_columnconfigure(0, weight=1, uniform="col")
    body.grid_columnconfigure(1, weight=1, uniform="col")
    body.grid_rowconfigure(0, weight=1)

    # Left column: stats + news
    left = tk.Frame(body, bg=COL["panel"], padx=16, pady=14)
    left.grid(row=0, column=0, sticky="nsew", padx=(0, 6))

    section_label(left, "Company Health").pack(anchor="w", pady=(0, 8))

    stat_bars, stat_vals = {}, {}
    style = ttk.Style()
    style.theme_use("default")
    for key, _ in STATS:
        style.configure(f"{key}.Horizontal.TProgressbar",
                        troughcolor=COL["panel2"], background=COL["good"],
                        thickness=10, borderwidth=0)

    for key, label in STATS:
        row = tk.Frame(left, bg=COL["panel"])
        row.pack(fill="x", pady=4)
        top = tk.Frame(row, bg=COL["panel"])
        top.pack(fill="x")
        tk.Label(top, text=label, font=(FONT, 10), bg=COL["panel"],
                 fg=COL["muted"], anchor="w").pack(side="left")
        v = tk.Label(top, text="50", font=(FONT, 10, "bold"),
                     bg=COL["panel"], fg=COL["text"])
        v.pack(side="right")
        bar = ttk.Progressbar(row, orient="horizontal", mode="determinate",
                              maximum=100, style=f"{key}.Horizontal.TProgressbar")
        bar.pack(fill="x", pady=(3, 0))
        stat_bars[key] = bar
        stat_vals[key] = v

    section_label(left, "News Feed").pack(anchor="w", pady=(16, 6))
    news_wrap = tk.Frame(left, bg=COL["line"], bd=0)
    news_wrap.pack(fill="both", expand=True)
    sb = tk.Scrollbar(news_wrap)
    sb.pack(side="right", fill="y")
    news_box = tk.Text(news_wrap, font=(FONT, 10), bg=COL["panel2"],
                       fg=COL["text"], relief="flat", bd=0, height=8,
                       wrap="word", padx=8, pady=8, yscrollcommand=sb.set)
    news_box.pack(side="left", fill="both", expand=True)
    news_box.tag_config("stamp", foreground=COL["muted"])
    sb.config(command=news_box.yview)
    news_box.config(state="disabled")

    # Right column: actions + shop
    right = tk.Frame(body, bg=COL["panel"], padx=16, pady=14)
    right.grid(row=0, column=1, sticky="nsew", padx=(6, 0))

    section_label(right, "Management Actions").pack(anchor="w", pady=(0, 8))
    actions = [
        ("📈  Training — $5,000  (Productivity +15)", act_training),
        ("🎁  Bonuses — $4,000  (Morale +20)", act_bonus),
        ("🧑‍💼  Recruit — $3,000  (+1 Employee)", act_recruit),
        ("📣  Marketing — $4,000  (Marketing +15, Rep +5)", act_marketing),
        ("🔬  R&D — $6,000  (Innovation +20)", act_rnd),
        ("☎️  Customer Service — $2,000  (Sat +15, Rep +3)", act_customer_service),
        ("🔁  Change Leadership Style", cycle_leadership),
        ("✨  Special Ability (style-based)", act_special),
    ]
    for text, cmd in actions:
        b = styled_button(right, text, cmd, kind="action")
        b.pack(fill="x", pady=2)

    section_label(right, "Upgrades").pack(anchor="w", pady=(14, 6))
    upgrade_buttons = {}
    for name in UPGRADES:
        b = styled_button(right, "", lambda n=name: buy_upgrade(n), kind="shop")
        b.pack(fill="x", pady=2)
        upgrade_buttons[name] = b

    section_label(right, "Departments").pack(anchor="w", pady=(14, 6))
    dept_buttons = {}
    for name in DEPARTMENTS:
        b = styled_button(right, "", lambda n=name: buy_department(n), kind="shop")
        b.pack(fill="x", pady=2)
        dept_buttons[name] = b

    # ---- Footer: toast + controls ----
    footer = tk.Frame(game_frame, bg=COL["bg"])
    footer.pack(fill="x", padx=12, pady=(6, 12))

    message_var = tk.StringVar()
    message_label = tk.Label(footer, textvariable=message_var, font=(FONT, 12, "bold"),
                             bg=COL["panel"], fg=COL["text"], anchor="w", padx=14, pady=10)
    message_label.pack(side="left", fill="x", expand=True)

    speed_btn = styled_button(footer, f"⏩  Speed: {game.speed}", cycle_speed, kind="action")
    speed_btn.pack(side="left", padx=(8, 0))
    pause_btn = styled_button(footer, "⏸  Pause", toggle_pause, kind="action")
    pause_btn.pack(side="left", padx=(8, 0))

    refresh_shop()


def refresh_shop():
    for name, btn in upgrade_buttons.items():
        info = UPGRADES[name]
        if game.upgrades[name]:
            btn.config(text=f"✓  {name} — Owned", state="disabled",
                       disabledforeground=COL["good"], bg=COL["panel2"])
        else:
            btn.config(text=f"{name} — ${info['cost']:,}\n   {info['desc']}",
                       state="normal", bg=btn._base_bg)
    for name, btn in dept_buttons.items():
        info = DEPARTMENTS[name]
        if game.departments[name]:
            btn.config(text=f"✓  {name} — Open", state="disabled",
                       disabledforeground=COL["good"], bg=COL["panel2"])
        else:
            btn.config(text=f"{name} — ${info['cost']:,}\n   {info['desc']}",
                       state="normal", bg=btn._base_bg)


def update_status():
    header_company.config(text=game.company or "Your Company")
    header_leader.config(
        text=f"Leadership: {game.leader_style.capitalize()}   •   "
             f"Difficulty: {game.difficulty}")
    header_money.config(text=f"${game.money:,}")
    header_period.config(text=f"Y{game.year} · M{game.month}")
    header_employees.config(text=str(game.employees))

    profit = calculate_profit()
    header_profit.config(text=f"${profit:,}",
                         fg=COL["good"] if profit >= 0 else COL["bad"])

    header_share.config(text=f"{game.market_share:.0f}% / {game.target()}%")

    for key, _ in STATS:
        val = int(getattr(game, key))
        stat_vals[key].config(text=str(val))
        bar = stat_bars[key]
        bar["value"] = val
        ttk.Style().configure(f"{key}.Horizontal.TProgressbar",
                              background=bar_color(val))


def finish(msg, win):
    game.running = False
    if game.tick_id:
        root.after_cancel(game.tick_id)
    pause_btn.config(state="disabled")
    speed_btn.config(state="disabled")
    add_news(msg, "good" if win else "bad")
    update_status()
    again = messagebox.askyesno("Game Over", f"{msg}\n\nPlay again?")
    if again:
        restart_game()
    else:
        root.destroy()


def restart_game():
    global game
    if game.tick_id:
        root.after_cancel(game.tick_id)
    game = Game()
    game_frame.destroy()
    show_start_screen()


# ---------------- START SCREEN ----------------
def show_start_screen():
    start = tk.Frame(root, bg=COL["bg"])
    start.pack(fill="both", expand=True)

    choice = {"company": None, "leader": "democratic", "difficulty": "Normal"}
    btn_groups = {"company": {}, "leader": {}, "difficulty": {}}

    tk.Label(start, text="HR MANAGEMENT SIMULATOR", font=(FONT, 26, "bold"),
             bg=COL["bg"], fg=COL["accent"]).pack(pady=(28, 2))
    tk.Label(start, text="Build a company. Beat the market. Don't go broke.",
             font=(FONT, 12), bg=COL["bg"], fg=COL["muted"]).pack(pady=(0, 4))
    tk.Label(start, text="by Jeffrey · ideas from Danila, Audrey & Lyra",
             font=(FONT, 9), bg=COL["bg"], fg=COL["line"]).pack(pady=(0, 18))

    container = tk.Frame(start, bg=COL["bg"])
    container.pack(fill="both", expand=True, padx=40)

    def select(group, value):
        choice[group] = value
        for v, b in btn_groups[group].items():
            if v == value:
                b.config(bg=COL["accent"], fg="#06121F")
                b._selected = True
            else:
                b.config(bg=COL["panel2"], fg=COL["text"])
                b._selected = False
        validate()

    def choice_card(title, group, options):
        card = tk.Frame(container, bg=COL["panel"], padx=16, pady=14)
        card.pack(fill="x", pady=8)
        section_label(card, title).pack(anchor="w", pady=(0, 8))
        for name, desc in options.items():
            b = tk.Button(
                card, text=f"{name}  —  {desc}",
                font=(FONT, 11), bg=COL["panel2"], fg=COL["text"],
                activebackground=COL["accent"], activeforeground="#06121F",
                relief="flat", bd=0, anchor="w", padx=12, pady=8, cursor="hand2",
                command=lambda g=group, n=name: select(g, n))
            b.pack(fill="x", pady=2)
            b._selected = False

            def mk(btn):
                btn.bind("<Enter>", lambda _e: not btn._selected and btn.config(bg=COL["line"]))
                btn.bind("<Leave>", lambda _e: not btn._selected and btn.config(bg=COL["panel2"]))
            mk(b)
            btn_groups[group][name] = b

    choice_card("Choose Your Company", "company", COMPANIES)
    choice_card("Leadership Style", "leader",
                {k.capitalize(): v for k, v in LEADERSHIP.items()})
    choice_card("Difficulty",  "difficulty",
                {"Easy": "Win at 50% market share, comfy cash",
                 "Normal": "Win at 70% — a fair fight",
                 "Hard": "Win at 90%, lean budget"})

    start_btn = styled_button(start, "▶  START YOUR EMPIRE", lambda: begin(), kind="primary")
    start_btn.pack(pady=18, ipadx=10)
    start_btn.config(state="disabled")

    def validate():
        ready = choice["company"] is not None
        start_btn.config(state="normal" if ready else "disabled")

    def begin():
        if not choice["company"]:
            return
        game.company = choice["company"]
        game.leader_style = choice["leader"].lower()
        game.difficulty = choice["difficulty"]

        if game.difficulty == "Easy":
            game.money, game.market_share = 30000, 15
        elif game.difficulty == "Hard":
            game.money, game.market_share = 15000, 5
        else:
            game.money, game.market_share = 20000, 10

        if game.company == "Tech Startup":
            game.innovation = clamp(game.innovation + 10)
            game.productivity = clamp(game.productivity - 5)
        elif game.company == "Restaurant Chain":
            game.customer_satisfaction = clamp(game.customer_satisfaction + 10)
            game.reputation = clamp(game.reputation + 5)
        elif game.company == "Manufacturing":
            game.productivity = clamp(game.productivity + 10)
            game.morale = clamp(game.morale - 5)
        elif game.company == "Entertainment":
            game.marketing = clamp(game.marketing + 10)
            game.reputation = clamp(game.reputation + 5)

        messagebox.showinfo("How to Play",
            "HR MANAGEMENT SIMULATOR\n\n"
            "• Each month earns profit = revenue − salaries. Keep stats high "
            "so revenue beats payroll.\n"
            "• Stats slowly decay — spend on actions, upgrades and departments "
            "to keep them up.\n"
            "• Strong marketing, reputation and satisfaction grow your market "
            "share toward the win target.\n"
            "• Watch out: low morale makes people quit; lawsuits, strikes and "
            "rivals will test you.\n"
            "• You lose if cash, employees or reputation hit zero.\n\n"
            "Use Pause and Speed to play at your own pace. Good luck!")

        start.destroy()
        build_game_screen()
        game_frame.pack(fill="both", expand=True)
        game.running = True
        add_news(f"{game.company} opens for business. Let's go!", "good")
        update_status()
        monthly_tick()


# ---------------- BOOT ----------------
root = tk.Tk()
root.title("HR Management Simulator")
root.configure(bg=COL["bg"])
root.geometry("960x820")
root.minsize(860, 760)
show_start_screen()
root.mainloop()
