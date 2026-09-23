# -*- coding: utf-8 -*-
"""Traducao do banco para ingles.

A tabela e dividida por secao (`banco_en_*.py`), porque ela e longa: cada modulo
traz um dicionario `DADOS` com id -> {'c': cenario, 'a': [alternativas]}, na MESMA
ORDEM em que o gerador cria as alternativas.

Ficam de fora, porque sao constantes e o gerador traduz sozinho:
  - a alternativa "nenhuma dessas";
  - as seis opcoes da escala de confirmacao.

O gerador confere a cobertura item a item: se faltar uma id, ou se o numero de
alternativas nao bater, ele avisa. Assim nao existe teste meio traduzido.

A traducao segue a regra do banco em portugues: a alternativa diz a MOTIVACAO
(a paixao, a fixacao, a crenca), nao so o comportamento. Ingles corrente, sem
giria e sem jargao de eneagrama.
"""

from banco_en_f1 import DADOS as _F1
from banco_en_f2 import DADOS as _F2I
from banco_en_f2e import DADOS as _F2E
from banco_en_f2m import DADOS as _F2M
from banco_en_f2d import DADOS as _F2D
from banco_en_cruz import DADOS as _CRUZ
from banco_en_f3 import DADOS as _F3
from banco_en_f4 import DADOS as _F4
from banco_en_conf import DADOS as _CONF

NULA_EN = 'None of these sounds like me.'
ESCALA_EN = [
    'This is completely me.',
    'This is me.',
    'This is a little bit me.',
    'Neutral, I could not say.',
    'This is not me.',
    'This is not me at all.',
]

EN = {}
for _parte in (_F1, _F2I, _F2E, _F2M, _F2D, _CRUZ, _F3, _F4, _CONF):
    EN.update(_parte)
