import math
import os
import random
import re

import random_choices

english_alphabet = 'a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(' ')

talon_alphabet = 'air bat cap drum each fine gust harp sit jury crunch look made near odd pit quench red sun trap urge vest whale plex yank zip'.split(' ')
# taken from https://en.wikipedia.org/wiki/Letter_frequency
letter_weights = [8167, 1492, 2782, 4253, 12702, 2228, 2015, 6094, 6966, 153, 772, 4025, 2406, 6749, 7507, 1929, 95, 5987, 6327, 9056, 2758, 978, 2360, 150, 1974, 74]

with open('text/common_words.txt', 'r') as f:
    common_words = f.read().split('\n')

word_map = {k: v for k, v in zip(english_alphabet, talon_alphabet)}
word_map['cmd'] = 'command'
with open('text/command_words.txt', 'r') as f:
    command_words = [' '.join([word_map.get(word, word) for word in line.split(' ')])
                     for line in f.read().split('\n')]

common_weights = [10 - math.log(i) for i in range(1, len(common_words)+1)]

def choices(l, weights=None, k=1):
    return ' '.join(random_choices.choices(l, weights, k=k))

phrases = []
def gen_common(k=1):
    return choices(common_words, common_weights, k=k)

def gen_command(k=1):
    return choices(command_words, k=k)

def gen_talon_alphabet(k=1):
    return choices(talon_alphabet, letter_weights, k=k)

def gen_english_alphabet(k=1):
    return choices(english_alphabet, letter_weights, k=k)

digits = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
teens = ['', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
tens = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

def humanize_low(n):
    if 11 <= n <= 19:
        return [teens[n - 11]]
    digit = digits[n % 10]
    ten = tens[(n // 10) % 10]
    hundred = digits[(n // 100) % 10]
    if hundred:
        return [hundred, 'hundred', ten, digit]
    return [ten, digit]

def humanize(n):
    if n == 0:
        return 'zero'

    group_0k = n % 1000
    group_1k = (n // 1000) % 1000
    group_1m = (n // 1000000) % 1000
    group_1b = (n // 1000000000) % 1000
    group_1t = (n // 1000000000000) % 1000

    out = []
    if group_1t: out += humanize_low(group_1t) + ['trillion']
    if group_1b: out += humanize_low(group_1b) + ['billion']
    if group_1m: out += humanize_low(group_1m) + ['million']
    if group_1k: out += humanize_low(group_1k) + ['thousand']
    if group_0k: out += humanize_low(group_0k)

    while '' in out:
        out.remove('')
    return ' '.join(out)

def gen_number(k=1):
    return ' '.join([humanize(random.randint(1, 10 ** random.randint(1, 12)))
                     for i in range(k)])

def gen_digits(k=1):
    return ' '.join([random.choice(digits[1:]) for i in range(k)])

def english_spell(text):
    out = []
    for c in text:
        if c == ' ':
            out.append('space')
        elif c == '-':
            out.append('dash')
        elif c.isalpha():
            out.append(c)
        elif c.isdigit():
            return []
    return ' '.join(out)

def talon_spell(text):
    out = []
    for c in text:
        if c == ' ':
            out.append('space')
        elif c == '-':
            out.append('dash')
        elif c.isalpha():
            out.append(talon_alphabet[ord(c.lower()) - ord('a')])
        elif c.isdigit():
            return []
    return ' '.join(out)

def gen_long(common=0, cmd=0, talon=0, eng=0, num=0, digit=0):
    vocab = []
    vocab.append(gen_common(common))
    vocab.append(gen_command(cmd))
    vocab.append(gen_talon_alphabet(talon))
    vocab.append(gen_english_alphabet(eng))
    vocab.append(gen_number(num))
    vocab.append(gen_digits(digit))
    random.shuffle(vocab)
    while '' in vocab:
        vocab.remove('')
    return ' '.join(vocab)

def gen_long_random(points=1):
    keys = ['common', 'cmd', 'talon', 'num', 'digit']
    has_numbers = random.randint(1, 10) < 3
    if not has_numbers:
        keys.remove('num')
        keys.remove('digit')
    random.shuffle(keys)
    kwargs = {}
    for key in keys:
        n = random.randint(0, points)
        kwargs[key] = n
        points -= n
    return gen_long(**kwargs)
