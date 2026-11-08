#!/usr/bin/env python3
"""Tekent de personages van de escaperoom en zet ze in de kamers en de portretten.

Elk personage wordt hier één keer getekend, in zijn eigen assenstelsel (de oorsprong ligt tussen de voeten), en daarna
met translate/scale op de goede plek gezet. Zo zien Roelof, Ditty, de gasten, het hobbelpaardje en de ree er overal
hetzelfde uit: in de kamers én in de portretten naast de gesprekken.

In de kamers (src/escaperoom/scenes/*.svg) staat elk personage tussen twee commentaren:
    <!-- @personage naam --> … <!-- @einde naam -->
Dit script vervangt wat daartussen staat. Gebruik: python3 tools/escaperoom/personages.py
"""
import os, re

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'src', 'escaperoom')

SKIN = {  # (huid, schaduw, wangen)
    'licht': ('#f6cfae', '#dca383', '#f29b8f'),
    'roze': ('#f3c2a4', '#d79c7c', '#ee8f86'),
    'zon': ('#e9b48c', '#c48a64', '#e48a76'),   # wie veel buiten werkt
    'midden': ('#d9a074', '#b67c52', '#e0806e'),
    'bruin': ('#a86b45', '#84502f', '#c8705e'),
    'sepia': ('#e6d2ae', '#b89a6e', '#d9b08a'),
}
INK = '#2a1b14'


def grad(id_, c1, c2, x1=0, y1=0, x2=0, y2=1):
    return f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient>'


def rgrad(id_, c1, c2, cx=.4, cy=.35, r=.75):
    return f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="{r}"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></radialGradient>'


def face(p, cx, cy, r, skin='licht', mouth='smile', brows=INK, ears=True, cheeks=True, eyes='open', nose=True, ink=INK):
    """Een rond, vriendelijk gezicht: oren, ogen met een lichtpuntje, wenkbrauwen, neus, wangen en een mond."""
    s, sd, ck = SKIN[skin]
    g = [f'<defs>{rgrad(p + "Sk", s, sd, .42, .35, .8)}</defs>']
    if ears:
        for sx in (-1, 1):
            g.append(f'<ellipse cx="{cx + sx * r * .95:.1f}" cy="{cy + r * .08:.1f}" rx="{r * .2:.1f}" ry="{r * .26:.1f}" fill="{s}" stroke="{sd}" stroke-width="{r * .05:.2f}"/>')
    g.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r * 1.06:.1f}" fill="url(#{p}Sk)" stroke="{sd}" stroke-width="{r * .05:.2f}"/>')
    ex, ey = r * .36, cy - r * .02
    for sx in (-1, 1):
        x = cx + sx * ex
        if eyes == 'closed':
            g.append(f'<path d="M{x - r * .13:.1f} {ey:.1f} q{r * .13:.1f} {r * .12:.1f} {r * .26:.1f} 0" stroke="{ink}" stroke-width="{r * .07:.2f}" fill="none" stroke-linecap="round"/>')
        else:
            g.append(f'<ellipse cx="{x:.1f}" cy="{ey:.1f}" rx="{r * .11:.2f}" ry="{r * .15:.2f}" fill="{ink}"/>'
                     f'<circle cx="{x + r * .04:.1f}" cy="{ey - r * .05:.1f}" r="{r * .045:.2f}" fill="#fff"/>')
        if brows:
            g.append(f'<path d="M{x - r * .16:.1f} {ey - r * .27:.1f} q{r * .16:.1f} {-r * .1:.1f} {r * .32:.1f} {r * .02:.1f}" stroke="{brows}" stroke-width="{r * .08:.2f}" fill="none" stroke-linecap="round"/>')
    if cheeks:
        for sx in (-1, 1):
            g.append(f'<ellipse cx="{cx + sx * r * .55:.1f}" cy="{cy + r * .3:.1f}" rx="{r * .17:.1f}" ry="{r * .11:.1f}" fill="{ck}" opacity=".55"/>')
    if nose:
        g.append(f'<ellipse cx="{cx}" cy="{cy + r * .2:.1f}" rx="{r * .14:.1f}" ry="{r * .11:.1f}" fill="{sd}" opacity=".7"/>'
                 f'<circle cx="{cx - r * .04:.1f}" cy="{cy + r * .16:.1f}" r="{r * .04:.2f}" fill="#fff" opacity=".6"/>')
    my = cy + r * .48
    if mouth == 'smile':
        g.append(f'<path d="M{cx - r * .3:.1f} {my:.1f} q{r * .3:.1f} {r * .26:.1f} {r * .6:.1f} 0" stroke="#8a3a2a" stroke-width="{r * .07:.2f}" fill="none" stroke-linecap="round"/>')
    elif mouth == 'open':
        g.append(f'<path d="M{cx - r * .3:.1f} {my - r * .03:.1f} q{r * .3:.1f} {r * .02:.1f} {r * .6:.1f} 0 q{-r * .05:.1f} {r * .34:.1f} {-r * .3:.1f} {r * .34:.1f} q{-r * .25:.1f} 0 {-r * .3:.1f} {-r * .34:.1f}z" fill="#8a2a24"/>'
                 f'<path d="M{cx - r * .14:.1f} {my + r * .24:.1f} q{r * .14:.1f} {-r * .1:.1f} {r * .28:.1f} 0" fill="#e2706a"/>'
                 f'<path d="M{cx - r * .24:.1f} {my:.1f} h{r * .48:.1f} v{r * .06:.1f} h{-r * .48:.1f}z" fill="#fff"/>')
    return ''.join(g)


def hand(x, y, r, fill, stroke):
    return f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r * 1.1:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{r * .14:.2f}"/>' \
           f'<path d="M{x - r * .2:.1f} {y - r * .9:.1f} q{r * .9:.1f} {-r * .1:.1f} {r * .9:.1f} {r * .7:.1f}" stroke="{stroke}" stroke-width="{r * .14:.2f}" fill="none" opacity=".6"/>'


def legs(color, shoes, w=11, h=78, gap=7):
    return (f'<path d="M-{gap + w} -{h} L-{gap + w - 1} -4 L-{gap - 1} -4 L-{gap} -{h}Z M{gap + w} -{h} L{gap + w - 1} -4 L{gap - 1} -4 L{gap} -{h}Z" fill="{color}" stroke="#00000030" stroke-width="1"/>'
            f'<path d="M-{gap + w + 3} -1 C-{gap + w + 3} -9 -{gap} -10 -{gap - 2} -6 L-{gap - 2} 0 Z M{gap + w + 3} -1 C{gap + w + 3} -9 {gap} -10 {gap - 2} -6 L{gap - 2} 0 Z" fill="{shoes}"/>')


# ---------------------------------------------------------------- Roelof
def glasses(cx, cy, r, color, round_=True):
    """Een bril over de ogen van face() (zelfde maten)."""
    ex, ey = r * .36, cy - r * .02
    w, h = r * .34, r * .3
    shape = (lambda x: f'<rect x="{x - w:.1f}" y="{ey - h:.1f}" width="{2 * w:.1f}" height="{2 * h:.1f}" rx="{h * (1 if round_ else .5):.1f}"/>')
    return (f'<g fill="#ffffff22" stroke="{color}" stroke-width="{r * .08:.2f}">{shape(cx - ex)}{shape(cx + ex)}</g>'
            f'<path d="M{cx - ex + w:.1f} {ey:.1f} q{ex - w:.1f} {-r * .08:.1f} {2 * (ex - w):.1f} 0 M{cx - ex - w:.1f} {ey:.1f} l{-r * .5:.1f} {-r * .05:.1f} M{cx + ex + w:.1f} {ey:.1f} l{r * .5:.1f} {-r * .05:.1f}" stroke="{color}" stroke-width="{r * .07:.2f}" fill="none"/>')


# ---------------------------------------------------------------- Roelof
def roelof(p, tool='hamer', arm_id=None, outfit=None):
    """Roelof: doet de klusjes en het museum. Kaal bovenop met een grijze rand, een donkere ronde bril, een gebruind
    gezicht. Bij het klussen een groene overall en klompen; op het feest (tool='glas') een blauw overhemd met print en een
    beige broek. Staand, ongeveer 175 eenheden hoog (voeten op 0)."""
    s, sd, _ = SKIN['zon']
    feest = (outfit or ('feest' if tool == 'glas' else 'overall')) == 'feest'
    hair = '#d4d2cc'
    if feest:
        top, top_d, top_l = '#5a7ac0', '#34508a', '#8aa4dc'
        g = [f'<defs>{grad(p + "Kiel", top_l, top_d, 0, 0, 1, 1)}<pattern id="{p}Print" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="url(#{p}Kiel)"/>'
             f'<path d="M0 10 a5 5 0 0 1 10 0" fill="#c9a24a" opacity=".55"/><path d="M5 5 a5 5 0 0 1 10 0 M-5 5 a5 5 0 0 1 10 0" fill="#22305a" opacity=".55"/></pattern></defs>']
        fill = f'url(#{p}Print)'
        g.append(legs('#cfc4ac', '#6a4428', 12, 76, 6))
        g.append('<path d="M-24 0 C-26 -9 -8 -11 -3 -6 L-3 0Z M24 0 C26 -9 8 -11 3 -6 L3 0Z" fill="#6a4428"/>')
        g.append(f'<path d="M-32 -74 C-34 -110 -30 -132 -18 -140 C-8 -144 8 -144 18 -140 C30 -132 34 -110 32 -74Z" fill="{fill}" stroke="#00000030" stroke-width="1.2"/>'
                 f'<path d="M-9 -142 L0 -130 L9 -142 L4 -146 L0 -138 L-4 -146Z" fill="{fill}" stroke="#22305a" stroke-width="1"/>'
                 f'<path d="M0 -130 V-78" stroke="{top_d}" stroke-width="1.4"/>'
                 f'<path d="M-33 -78 Q0 -70 33 -78 L33 -72 Q0 -64 -33 -72Z" fill="#7a4a26"/><rect x="-5" y="-78" width="10" height="7" fill="none" stroke="#c9a24a" stroke-width="1.6"/>')
        sleeve = 9
    else:
        top, top_d = '#2e6a5a', '#1a443a'
        g = [f'<defs>{grad(p + "Kiel", "#3e8a74", top_d, 0, 0, 1, 1)}</defs>']
        fill = f'url(#{p}Kiel)'
        g.append(legs(top, '#2a2420', 12, 76, 6))
        g.append('<path d="M-24 0 C-26 -10 -8 -12 -3 -6 L-3 0Z M24 0 C26 -10 8 -12 3 -6 L3 0Z" fill="#2a2420"/>')
        # de groene overall, met een rits en een borstzakje
        g.append(f'<path d="M-32 -66 C-34 -110 -30 -132 -18 -140 C-8 -144 8 -144 18 -140 C30 -132 34 -110 32 -66Z" fill="{fill}" stroke="#00000030" stroke-width="1.2"/>'
                 f'<path d="M-8 -143 L0 -132 L8 -143" stroke="{top_d}" stroke-width="3" fill="none"/>'
                 f'<path d="M0 -132 V-70" stroke="#c9a24a" stroke-width="1.6"/>'
                 f'<rect x="10" y="-126" width="14" height="12" rx="2" fill="{top_d}"/><path d="M14 -128 v-8 M18 -128 v-6" stroke="#c9a24a" stroke-width="2"/>'
                 f'<path d="M-30 -78 h60" stroke="{top_d}" stroke-width="3"/>')
        sleeve = 13
    # armen
    g.append(f'<path d="M-28 -132 C-40 -112 -40 -92 -36 -76" stroke="{fill}" stroke-width="{sleeve + 4}" fill="none" stroke-linecap="round"/>'
             + (f'<path d="M-37 -104 C-40 -92 -38 -82 -36 -76" stroke="{s}" stroke-width="9" fill="none" stroke-linecap="round"/>' if feest else '')
             + hand(-36, -70, 6.5, s, sd))
    arm = (f'<path d="M28 -132 C40 -112 42 -96 40 -80" stroke="{fill}" stroke-width="{sleeve + 4}" fill="none" stroke-linecap="round"/>'
           + (f'<path d="M40 -104 C42 -94 41 -86 40 -80" stroke="{s}" stroke-width="9" fill="none" stroke-linecap="round"/>' if feest else '')
           + hand(40, -74, 6.5, s, sd))
    if tool == 'hamer':
        arm += '<path d="M41 -74 L58 -100" stroke="#8a5a32" stroke-width="4.5" stroke-linecap="round"/><path d="M50 -108 L66 -94" stroke="#6f767e" stroke-width="8" stroke-linecap="round"/>'
    elif tool == 'sleutel':
        arm += '<path d="M41 -74 L56 -96" stroke="#9aa0a6" stroke-width="4" stroke-linecap="round"/><circle cx="58" cy="-99" r="5" fill="none" stroke="#9aa0a6" stroke-width="3"/>'
    elif tool == 'glas':
        arm += '<path d="M33 -92 l3 18 h10 l3 -18z" fill="#f4d58a" opacity=".85" stroke="#fff" stroke-width="1"/><path d="M33 -92 h16" stroke="#fffbe8" stroke-width="3"/>'
    g.append(f'<g id="{arm_id}">{arm}</g>' if arm_id else arm)
    g.append(f'<rect x="-6" y="-152" width="12" height="12" fill="{sd}"/>')
    # een wat langer, gebruind hoofd, kaal bovenop
    g.append(face(p, 0, -169, 19, 'zon', brows='#9a968e'))
    g.append(f'<ellipse cx="-4" cy="-184" rx="8" ry="4" fill="#fff" opacity=".22"/>')
    # een grijze rand haar aan de zijkant en achter de oren
    g.append(f'<path d="M-17.5 -182 C-20 -176 -20.5 -170 -19.5 -164 M17.5 -182 C20 -176 20.5 -170 19.5 -164" stroke="{hair}" stroke-width="4.5" fill="none" stroke-linecap="round"/>')
    g.append(glasses(0, -169, 19, '#2a2420'))
    return ''.join(g)


# ---------------------------------------------------------------- Ditty
def ditty(p, hold='koffie'):
    """Ditty: doet de B&B. Kort grijs haar, een rode bril, een taupe blouse met witte bloemen, een lichte broek en een
    gouden kettinkje. Staand, ~168 eenheden hoog."""
    s, sd, _ = SKIN['roze']
    hair, hair_l = '#cfccc6', '#eeece8'
    top, top_d = '#b8aa98', '#8e8070'
    g = [f'<defs>{grad(p + "Vest", "#cbbeac", top_d, 0, 0, 1, 1)}</defs>']
    g.append(legs('#e4dfd4', '#8a6a4a', 11, 64, 6).replace('stroke="#00000030"', 'stroke="#bdb6a6"'))
    # de blouse, wijd, met een riem
    g.append(f'<path d="M-30 -60 C-33 -100 -30 -126 -16 -134 C-8 -137 8 -137 16 -134 C30 -126 33 -100 30 -60Z" fill="url(#{p}Vest)" stroke="#00000026" stroke-width="1.2"/>'
             f'<path d="M-8 -136 L0 -122 L8 -136" stroke="{top_d}" stroke-width="2" fill="{s}"/>'
             f'<path d="M-28 -76 Q0 -70 28 -76 L28 -70 Q0 -64 -28 -70Z" fill="#d9c9a4"/><circle cx="6" cy="-71" r="4" fill="#c9a26a"/>')
    # witte bloemen geborduurd op de schouders
    for sx in (-1, 1):
        x = sx * 16
        g.append(f'<g fill="none" stroke="#f6f2ea" stroke-width="1.3" opacity=".9"><path d="M{x} -126 c{sx * 4} -4 {sx * 8} 0 {sx * 4} 4 c{sx * -4} 4 {sx * -8} 0 {sx * -4} -4z"/>'
                 f'<path d="M{x} -126 c{sx * -4} 4 {sx * -2} 8 {sx * 2} 8"/><path d="M{x + sx * 2} -118 q{sx * 4} 6 {sx * 2} 12"/></g>')
    # gouden kettinkje
    g.append(f'<path d="M-9 -134 Q0 -118 9 -134" stroke="#d6a640" stroke-width="1.4" fill="none"/>')
    # armen
    g.append(f'<path d="M-24 -126 C-36 -110 -36 -94 -28 -84" stroke="url(#{p}Vest)" stroke-width="13" fill="none" stroke-linecap="round"/>' + hand(-27, -80, 6, s, sd))
    if hold == 'koffie':
        g.append(f'<path d="M24 -126 C34 -112 30 -100 20 -96" stroke="url(#{p}Vest)" stroke-width="13" fill="none" stroke-linecap="round"/>'
                 '<g><path d="M12 -114 h20 l-2 24 h-16z" fill="#f2efe8" stroke="#9a948a" stroke-width="1.4"/><path d="M32 -108 q8 2 6 10 q-2 6 -8 4" stroke="#9a948a" stroke-width="2.4" fill="none"/>'
                 '<path d="M12 -114 l-6 -4 M14 -114 h16" stroke="#9a948a" stroke-width="2"/><path d="M16 -102 q6 -3 10 0" stroke="#6a8ec4" stroke-width="2" fill="none"/></g>'
                 + hand(20, -96, 6, s, sd))
    else:
        g.append(f'<path d="M24 -126 C36 -110 36 -94 28 -84" stroke="url(#{p}Vest)" stroke-width="13" fill="none" stroke-linecap="round"/>' + hand(27, -80, 6, s, sd))
    g.append(f'<rect x="-5" y="-146" width="10" height="12" fill="{sd}"/>')
    g.append(face(p, 0, -160, 18, 'roze', brows='#8a8680'))
    # kort grijs haar, een beetje opgewaaid, met oorbellen
    g.append(f'<path d="M-19 -162 C-23 -182 -8 -188 2 -185 C14 -188 23 -180 19 -162 C17 -170 13 -174 6 -175 C2 -172 -4 -172 -8 -174 C-13 -172 -17 -168 -19 -162Z" fill="{hair}"/>'
             f'<path d="M-2 -184 q3 -5 8 -4 M6 -185 q4 -3 8 -1" stroke="{hair}" stroke-width="3.5" stroke-linecap="round" fill="none"/>'
             f'<path d="M-6 -182 C2 -185 10 -182 14 -176" stroke="{hair_l}" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
             f'<path d="M-19 -164 C-20.5 -159 -20 -156 -18.5 -154 M19 -164 C20.5 -159 20 -156 18.5 -154" stroke="{hair}" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
             f'<circle cx="-17" cy="-150" r="1.6" fill="#d6a640"/><circle cx="17" cy="-150" r="1.6" fill="#d6a640"/>')
    g.append(glasses(0, -160, 18, '#9a1e2a', round_=False))
    return ''.join(g)


# ---------------------------------------------------------------- gasten op het feest
def guest(p, skin, hair, style, top, legcol, glass=True, dress=False, h=1.0):
    s, sd, _ = SKIN[skin]
    g = []
    if style == 'long':
        g.append(f'<path d="M-20 -164 C-26 -140 -26 -122 -18 -112 L18 -112 C26 -122 26 -140 20 -164Z" fill="{hair}"/>')
    if dress:
        g.append(legs('#00000000', '#3a2a24', 8, 50, 6).replace('#00000000', s))
        g.append(f'<path d="M-30 -48 L-20 -126 C-10 -132 10 -132 20 -126 L30 -48Z" fill="{top}" stroke="#00000026" stroke-width="1.2"/>')
    else:
        g.append(legs(legcol, '#2a2420', 11, 74, 6))
        g.append(f'<path d="M-28 -72 C-31 -104 -28 -122 -16 -130 C-8 -134 8 -134 16 -130 C28 -122 31 -104 28 -72Z" fill="{top}" stroke="#00000026" stroke-width="1.2"/>')
    g.append(f'<path d="M-24 -124 C-34 -106 -34 -92 -28 -80" stroke="{top}" stroke-width="11" fill="none" stroke-linecap="round"/>' + hand(-28, -76, 6, s, sd))
    if glass:
        g.append(f'<path d="M24 -124 C34 -110 32 -100 24 -94" stroke="{top}" stroke-width="11" fill="none" stroke-linecap="round"/>'
                 '<path d="M18 -116 l2 18 h8 l2 -18z" fill="#f4d58a" opacity=".9" stroke="#fff" stroke-width="1"/><path d="M18 -116 h12" stroke="#fffbe8" stroke-width="3"/>'
                 + hand(24, -96, 6, s, sd))
    else:
        g.append(f'<path d="M24 -124 C34 -106 34 -92 28 -80" stroke="{top}" stroke-width="11" fill="none" stroke-linecap="round"/>' + hand(28, -76, 6, s, sd))
    g.append(f'<rect x="-5" y="-142" width="10" height="12" fill="{sd}"/>')
    g.append(face(p, 0, -156, 17, skin))
    if style == 'short':
        g.append(f'<path d="M-17 -158 C-19 -178 -4 -180 2 -177 C12 -180 19 -172 17 -156 C12 -166 6 -168 -2 -170 C-8 -166 -12 -164 -17 -158Z" fill="{hair}"/>')
    elif style == 'long':
        g.append(f'<path d="M-18 -156 C-20 -178 -4 -180 2 -177 C12 -180 20 -172 18 -154 C12 -166 4 -168 -2 -170 C-8 -166 -14 -164 -18 -156Z" fill="{hair}"/>')
    elif style == 'curly':
        g.append(''.join(f'<circle cx="{x}" cy="{y}" r="7" fill="{hair}"/>' for x, y in [(-14, -166), (-7, -173), (2, -175), (11, -171), (16, -162), (-17, -157)]))
    elif style == 'bald':
        g.append(f'<path d="M-17 -152 C-19 -160 -16 -164 -14 -162 M17 -152 C19 -160 16 -164 14 -162" stroke="{hair}" stroke-width="5" fill="none" stroke-linecap="round"/>')
    return f'<g transform="scale({h})">' + ''.join(g) + '</g>'


# ---------------------------------------------------------------- het hobbelpaardje (de gratis hint)
def paardje(p):
    """Het houten hobbelpaardje uit het raam van de Paardenstal. Oorsprong onder het midden van de hobbels."""
    return (f'<defs>{grad(p + "W", "#e8c18a", "#b07c40", 0, 0, 1, 1)}</defs>'
            '<path d="M-58 -6 Q0 18 58 -6" stroke="#7a4a20" stroke-width="7" fill="none" stroke-linecap="round"/>'
            f'<path d="M-32 -44 L-40 0 M-18 -44 L-22 4 M18 -44 L22 4 M32 -44 L40 0" stroke="url(#{p}W)" stroke-width="7" stroke-linecap="round"/>'
            f'<path d="M-40 -60 C-40 -74 30 -76 34 -60 C36 -48 28 -40 0 -40 C-30 -40 -40 -46 -40 -60Z" fill="url(#{p}W)" stroke="#8a5a2a" stroke-width="2.4"/>'
            f'<path d="M24 -64 C30 -86 38 -100 50 -104 C62 -106 70 -98 68 -90 C66 -84 58 -84 52 -84 C48 -76 44 -66 38 -58Z" fill="url(#{p}W)" stroke="#8a5a2a" stroke-width="2.4"/>'
            '<path d="M40 -100 C34 -96 30 -86 26 -74 M44 -103 C38 -99 34 -88 30 -78" stroke="#4a2a14" stroke-width="5" fill="none" stroke-linecap="round"/>'
            '<path d="M48 -104 l2 -10 l6 8z" fill="#c99556" stroke="#8a5a2a" stroke-width="1.6"/>'
            '<circle cx="56" cy="-96" r="2.6" fill="#2a1a0c"/><circle cx="57" cy="-97" r=".9" fill="#fff"/>'
            '<path d="M60 -88 q4 2 7 0" stroke="#4a2a14" stroke-width="1.6" fill="none"/>'
            '<path d="M-40 -60 C-52 -58 -58 -48 -56 -36 C-50 -44 -46 -52 -40 -54" fill="#4a2a14"/>'
            '<path d="M-10 -66 h22 v6 h-22z" fill="#c4302b"/><path d="M50 -84 L40 -64" stroke="#c4302b" stroke-width="2"/>')


# ---------------------------------------------------------------- de ree
def ree(p, grazing=False, head_id=None):
    """Een ree, van opzij, kijkend naar rechts. Oorsprong tussen de voorste en achterste poten, op de grond."""
    fur, fur_d, belly = '#a8714a', '#7a4e30', '#e8d2b4'
    head = ('<g transform="rotate(48 40 -58)">' if grazing else '<g>')
    head += (f'<path d="M30 -58 C34 -72 38 -84 46 -92 L58 -86 C52 -78 48 -66 44 -54Z" fill="{fur}"/>'
             f'<path d="M44 -94 C50 -100 62 -100 70 -94 C76 -90 78 -84 74 -82 C66 -80 58 -82 52 -80 C46 -82 42 -88 44 -94Z" fill="{fur}" stroke="{fur_d}" stroke-width="1.4"/>'
             '<ellipse cx="75" cy="-84" rx="3" ry="2.4" fill="#2a1a10"/>'
             '<circle cx="58" cy="-92" r="2.6" fill="#1a100a"/><circle cx="59" cy="-93" r=".8" fill="#fff"/>'
             f'<path d="M46 -96 C40 -110 44 -114 50 -106Z M52 -98 C52 -114 58 -114 58 -102Z" fill="{fur}" stroke="{fur_d}" stroke-width="1.2"/>'
             '<path d="M47 -104 C45 -108 46 -110 48 -106" stroke="#e8b8a0" stroke-width="2"/></g>')
    g = [f'<path d="M-32 -50 L-36 -18 L-34 0 M-24 -48 L-22 -18 L-26 0 M24 -50 L26 -20 L24 0 M32 -50 L36 -20 L34 0" stroke="{fur_d}" stroke-width="5" fill="none" stroke-linecap="round"/>',
         f'<path d="M-42 -62 C-44 -76 -24 -82 0 -80 C22 -80 36 -74 40 -62 C42 -50 32 -44 0 -44 C-28 -44 -42 -48 -42 -62Z" fill="{fur}" stroke="{fur_d}" stroke-width="1.4"/>',
         f'<path d="M-30 -50 C-10 -46 14 -46 30 -50" stroke="{belly}" stroke-width="5" fill="none" opacity=".7"/>',
         f'<ellipse cx="-42" cy="-64" rx="7" ry="9" fill="#f6efe4"/>',
         f'<g id="{head_id}">{head}</g>' if head_id else head]
    return ''.join(g)


# ---------------------------------------------------------------- portretten
def portrait(title, bg, body, tx, ty, sc, sepia=False):
    filt = ('<filter id="sep"><feColorMatrix type="matrix" values=".39 .77 .19 0 0  .35 .69 .17 0 0  .27 .53 .13 0 0  0 0 0 1 0"/></filter>' if sepia else '')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><title>{title}</title>'
            f'<defs><clipPath id="clip"><rect width="120" height="120" rx="14"/></clipPath>{rgrad("bg", bg[0], bg[1], .5, .3, .9)}{filt}</defs>'
            f'<g clip-path="url(#clip)"><rect width="120" height="120" fill="url(#bg)"/>'
            f'<g{" filter=\"url(#sep)\"" if sepia else ""} transform="translate({tx} {ty}) scale({sc})">{body}</g></g></svg>\n')


def you(p):
    """Jij, de gast: met een fietshelm en een rugzak (alleen voor het portret)."""
    s, sd, _ = SKIN['licht']
    g = [f'<path d="M-40 60 C-40 20 -24 6 0 6 C24 6 40 20 40 60Z" fill="#2f8a7a"/>',
         '<path d="M-28 14 L-22 60 M28 14 L22 60" stroke="#e8902e" stroke-width="6"/>']
    g.append(face(p, 0, -20, 22, 'licht', mouth='open'))
    g.append(f'<path d="M-22 -24 C-26 -46 -6 -50 2 -46 C14 -50 26 -42 22 -24 C16 -36 8 -38 0 -38 C-8 -36 -16 -34 -22 -24Z" fill="#7a4a26"/>')
    # fietshelm
    g.append('<path d="M-27 -30 C-30 -60 28 -62 28 -30 C10 -36 -10 -36 -27 -30Z" fill="#f2b631" stroke="#a8781c" stroke-width="2"/>'
             '<path d="M-14 -52 l4 14 M0 -55 v16 M14 -52 l-4 14" stroke="#a8781c" stroke-width="3"/>'
             '<path d="M-26 -30 C-28 -16 -24 -4 -16 2 M26 -30 C28 -16 24 -4 16 2" stroke="#3a3a3a" stroke-width="2" fill="none"/>')
    return ''.join(g)


def harm(p):
    """Harm, de knecht van de boerderij in 1921: pet, snor, een boord zonder das (portret, in sepia)."""
    s, sd, _ = SKIN['sepia']
    g = [f'<path d="M-42 60 C-42 18 -24 6 0 6 C24 6 42 18 42 60Z" fill="#4a4036"/>',
         '<path d="M-10 6 L0 22 L10 6Z" fill="#f2ead8"/><path d="M-26 12 L-14 60 M26 12 L14 60" stroke="#3a322a" stroke-width="2"/>']
    g.append(face(p, 0, -20, 22, 'sepia', mouth=None))
    g.append('<path d="M-12 -6 C-6 -10 -2 -8 0 -6 C2 -8 6 -10 12 -6 C8 -2 4 -2 0 -4 C-4 -2 -8 -2 -12 -6Z" fill="#5a4636"/>'
             '<path d="M-7 0 q7 4 14 0" stroke="#7a3a2a" stroke-width="1.6" fill="none"/>')
    g.append('<path d="M-25 -30 C-28 -52 26 -54 26 -30Z" fill="#3a342e"/><path d="M-20 -30 C-8 -24 24 -24 36 -28 C30 -34 10 -34 -20 -32Z" fill="#2a2420"/>'
             '<path d="M-24 -40 C-10 -44 10 -44 24 -40" stroke="#4a443e" stroke-width="2" fill="none"/>')
    return ''.join(g)


PORTRAITS = {
    'roelof': ('Roelof', ('#2e6a5a', '#0e2a22'), lambda: roelof('pR', tool=None), 60, 288, 1.45),
    'ditty': ('Ditty', ('#8a5a8e', '#2e1a30'), lambda: ditty('pD', hold=None), 60, 300, 1.5),
    'you': ('Jij, de gast', ('#2f8a7a', '#0e2e28'), lambda: you('pY'), 58, 82, 1.1),
    'harm': ('Harm, de knecht (1921)', ('#a89070', '#3e3226'), lambda: harm('pH'), 60, 80, 1.15),
    'paardje': ('Het hobbelpaardje', ('#c4302b', '#3e0a10'), lambda: paardje('pP'), 50, 108, .72),
    'gast': ('Een gast', ('#4f8a4a', '#16301a'), lambda: guest('pG', 'licht', '#3a2a1a', 'curly', '#d9822b', '#334', glass=False), 60, 270, 1.5),
}


def place(body, tx, ty, sc=1, flip=False):
    sx = -sc if flip else sc
    return f'<g transform="translate({tx} {ty}) scale({sx} {sc})">{body}</g>'


SCENES = {
    'erf': {
        'roelof': lambda: place(roelof('efR', tool='hamer', arm_id='ef-arm'), 0, 0, 1.0),
        'ree': lambda: place(ree('efE', head_id='ef-reehead'), 0, 0, .55),
    },
    'stal': {},
    'zolder': {
        'roelof': lambda: place(roelof('zlR', tool='sleutel'), 0, 0, 1.25),
    },
    'kamer': {
        'ditty': lambda: place(ditty('kmD', hold='koffie'), 0, 0, 1.3),
    },
    'museum': {
        'roelof': lambda: place(roelof('muR', tool=None), 0, 0, 1.35),
    },
    'dak': {
        'ree': lambda: place(ree('dkE', grazing=True), 0, 0, .22) + place(ree('dkE2'), 60, 4, .2, flip=True),
    },
    'zaal': {
        'ditty': lambda: place(ditty('zaD', hold=None), 0, 0, 1.35),
        'roelof': lambda: place(roelof('zaR', tool='glas'), 0, 0, 1.4),
        'gasten': lambda: (place(guest('zaG1', 'licht', '#7a4a26', 'long', '#2f6fb1', '#334', dress=True), 0, 0, 1.25)
                           + place(guest('zaG2', 'bruin', '#1f1f1f', 'curly', '#d9822b', '#3b3f4a'), 70, 4, 1.3)
                           + place(guest('zaG3', 'roze', '#cfcac2', 'bald', '#5a8a4a', '#4a4036', glass=False), 140, 0, 1.28)
                           + place(guest('zaG4', 'licht', '#e0b860', 'short', '#c73f6d', '#2b3f66'), 214, 6, 1.2)),
    },
    'tuin': {
        'ree': lambda: place(ree('tnE', head_id='tn-reehead'), 0, 0, .9),
    },
}


def main():
    for scene, parts in SCENES.items():
        path = os.path.join(ROOT, 'scenes', scene + '.svg')
        if not os.path.exists(path):
            continue
        src = open(path, encoding='utf-8').read()
        for name, fn in parts.items():
            pat = re.compile(r'(<!--\s*@personage\s+' + re.escape(name) + r'\s*-->)(.*?)(<!--\s*@einde\s+' + re.escape(name) + r'\s*-->)', re.S)
            if not pat.search(src):
                raise SystemExit(f'{scene}.svg: geen plek voor personage "{name}"')
            src = pat.sub(lambda m: m.group(1) + fn() + m.group(3), src)
        open(path, 'w', encoding='utf-8').write(src)
    for name, (title, bg, fn, tx, ty, sc) in PORTRAITS.items():
        open(os.path.join(ROOT, 'portraits', name + '.svg'), 'w', encoding='utf-8').write(portrait(title, bg, fn(), tx, ty, sc, sepia=(name == 'harm')))
    print('Personages getekend.')


if __name__ == '__main__':
    main()
