#!/usr/bin/env python3
"""
Genera PDF — 3 Partes Emocionales CTA: Apego Detox
Habla directo al corazón. Toca los dolores. La única salida.
~12,500 caracteres por parte.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    HRFlowable
)
import os

# ─── Colors ───
GOLD = HexColor("#e8c840")
DARK_TEXT = HexColor("#1a1a1a")
MEDIUM_GRAY = HexColor("#444444")
LIGHT_GRAY = HexColor("#999999")
DARK_RED = HexColor("#8B0000")

# ─── Output ───
script_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(script_dir, "CTA_Emocional_ApegoDetox_3Partes.pdf")

# ─── Content: 3 parts ───
parts = []

# ═══════════════════════════════════════════════════════════════
# PARTE 1: YO SÉ LO QUE SIENTES (~12,500 chars)
# ═══════════════════════════════════════════════════════════════
parts.append({
    "num": 1,
    "title": "Yo sé lo que sientes — Y no estás loca",
    "body": """Sé que estás leyendo esto a las dos de la mañana. O quizás son las tres. Da igual la hora. Lo que importa es que no puedes dormir. Otra vez. Tienes el teléfono en la mano, con la pantalla iluminándote la cara en la oscuridad, y has revisado su última conexión cuatro veces en los últimos diez minutos. No has comido bien en días. O comiste demasiado sin saber por qué. Tu estómago se siente como si alguien te hubiera metido una piedra adentro y no la puedes sacar. Eso que sientes en el pecho, esa presión que no se va, ese nudo que te aprieta la garganta cuando piensas en él, eso no son nervios. Es tu sistema nervioso gritándote que algo está muy mal. Y tú ya lo sabes. Claro que lo sabes.

Sabes que te hace daño. Sabes que cada vez que vuelve te destruye un poco más. Sabes que esa relación te está consumiendo como un fuego lento que te va quemando desde adentro. Lo sabes con la cabeza. Pero tu cuerpo no obedece. Tu cuerpo quiere volver. Tu cuerpo necesita esa llamada, ese mensaje, esa migaja de atención que él te tira cuando le conviene. Y tú la recoges. Siempre la recoges. No porque seas débil. No porque seas tonta. No porque no tengas dignidad. La recoges porque tu cerebro está secuestrado. Literalmente. Neurológicamente. Químicamente secuestrado por un patrón que tú no elegiste y que no sabes cómo romper.

Yo soy Javier Vieira, psicólogo especialista, y llevo años trabajando con mujeres que sienten exactamente lo que tú sientes ahora mismo. Mujeres brillantes, fuertes, capaces, que no entienden por qué no pueden soltar a alguien que las destruye. No estoy aquí para juzgarte. No estoy aquí para decirte lo que ya te han dicho mil veces: déjalo, supéralo, tú vales más. Eso ya lo sabes. Lo que nadie te ha explicado es por qué no puedes hacerlo aunque quieras. Y eso es exactamente lo que voy a hacer ahora. Voy a describir tu vida. No la vida de alguien genérico. Tu vida. Lo que tú sientes. Lo que tú vives cada día. Porque si entiendes qué te pasa, dejas de creer que estás loca. Y eso cambia todo.

Empecemos por lo que te pasa cuando él se va. Cuando él te deja, cuando se aleja, cuando simplemente deja de contestar, tu cuerpo entra en un estado que se llama activación simpática crónica. En palabras simples, tu sistema nervioso se activa como si estuvieras en peligro de muerte. Porque para tu cerebro, así es. Tu cerebro primitivo, el que lleva millones de años protegiéndote, no distingue entre que un león te persiga y que esa persona te abandone. La respuesta biológica es idéntica. Cortisol inundando tu cuerpo. Adrenalina disparándose. Tu corazón se acelera. Tus manos tiemblan. No puedes pensar con claridad. Sientes que te vas a morir. Y no estás exagerando. Tu cuerpo genuinamente cree que se va a morir. Porque para un cerebro programado con apego ansioso, el abandono equivale a la muerte.

Entonces haces lo que cualquier ser humano haría ante una amenaza de muerte: intentas sobrevivir. Le escribes. Le llamas. Le mandas un mensaje largo a las cuatro de la mañana pidiéndole que hable contigo. Escribes, borras, escribes de nuevo. Revisas sus redes. Buscas señales. Interpretas cada historia que sube, cada foto que le da like, cada minuto que tarda en contestar. Analizas sus palabras. Buscas pistas en cada punto, en cada coma, en cada emoji que pone o deja de poner. Tu cerebro entra en modo detective porque necesita información para sentirse seguro. Pero la información nunca es suficiente. Nunca. Porque el problema no es lo que él hace o deja de hacer. El problema es lo que tu sistema nervioso aprendió a necesitar.

Y aquí viene lo que nadie te dice. Eso que tú sientes cuando él vuelve, esa oleada de alivio, esa felicidad intensa que te recorre todo el cuerpo cuando te dice que te extraña, cuando te abraza después de días sin hablarte, cuando te mira así como solo él sabe mirarte, cuando dice las palabras exactas que necesitabas escuchar, eso no es amor. Es dopamina. Es la misma sustancia que se libera en el cerebro de un adicto cuando por fin consigue su dosis después de días de abstinencia. Exactamente la misma reacción química. Tu cerebro está enganchado al ciclo dolor y alivio. Al ciclo de te destruyo y después te reconstruyo. Y cada vez que él vuelve y tú sientes esa paz inmensa, ese suspiro de por fin, tu cerebro registra esa experiencia como la cosa más placentera del mundo. Más que la comida. Más que el sexo. Más que cualquier otra experiencia humana. Porque el alivio del dolor es la droga más potente que existe. No lo digo yo. Lo dice la neurociencia. Lo dicen Carnes, Bowlby, van der Kolk. Investigadores que llevan décadas estudiando exactamente esto.

Por eso no puedes dejarlo. No es falta de voluntad. No es falta de amor propio. No es falta de inteligencia. No es que no sepas lo que te conviene. Es que tu cerebro está programado para volver. Cada vez que él se va y después regresa, el circuito se fortalece. Cada reconciliación hace que la siguiente ruptura duela más y la siguiente vuelta sea más adictiva. Es un ciclo que se alimenta a sí mismo. Se llama refuerzo intermitente. Es el mismo patrón que usan las máquinas tragamonedas para mantener a la gente enganchada. A veces ganas. A veces pierdes. Y justamente porque no sabes cuándo viene el premio, no puedes parar. Y mientras más tiempo llevas en ese ciclo, más difícil es salir. No imposible. Difícil. Pero no imposible.

¿Te suena familiar lo que voy a decir? Tienes días buenos. Días donde dices basta, donde sientes fuerza, donde te miras al espejo y te dices a ti misma que no vas a volver a caer. Y lo crees. De verdad lo crees. Esos días te sientes invencible. Bloqueas su número. Borras las fotos. Les dices a tus amigas esta vez sí es la definitiva. Pero entonces pasan dos días. Tres. Una semana. Y el silencio empieza a pesar. Y la fortaleza empieza a agrietarse. Y tu mente empieza a buscar. Empiezas a recordar los buenos momentos. Solo los buenos. Tu cerebro filtra automáticamente todo lo malo, todo el dolor, todos los gritos, todas las lágrimas, y te presenta un álbum de fotos perfectas de los mejores momentos con él. Esa vez que te cocinó cuando estabas enferma. Esa vez que te dijo que eras la mujer de su vida. Esa vez que se quedaron hablando hasta las cinco de la mañana sobre sus sueños. Y de repente el dolor de su ausencia se vuelve más grande que el dolor de estar con él. Y desbloqueas el número. Y le escribes. Y vuelves. Y te odias por volver. Pero vuelves.

No estás loca. Tu cerebro está haciendo exactamente lo que fue programado para hacer. Es un programa que se llama apego ansioso hiperactivado, y no es algo que tú elegiste. Fue instalado por alguien que no tenía derecho a programarte. Y tú mereces que alguien te enseñe a desinstalarlo. No con fuerza de voluntad. No con frases motivacionales. Con conocimiento real de qué te pasa y por qué te pasa.

Déjame decirte algo más que probablemente nadie te ha dicho con estas palabras. Tú no elegiste esto. Nadie elige enamorarse de alguien que le hace daño. Nadie se despierta una mañana y dice quiero sufrir, quiero llorar todas las noches, quiero perder a mis amigas una por una, quiero no reconocerme en el espejo, quiero sentir este vacío que me come por dentro. Eso no se elige. Se aprende. Y se aprende muy temprano. Mucho antes de que pudieras decidir qué querías para tu vida.

Piénsalo un momento. Cierra los ojos si puedes. Piensa en tu infancia. Piensa en cómo era el amor en tu casa. Piensa en tu mamá. ¿Cómo amaba ella? ¿Qué aguantaba ella? Piensa en tu papá. ¿Estaba? ¿Se iba? ¿Volvía? ¿Gritaba? ¿Desaparecía? Piensa en quién se quedaba y quién se iba. Piensa en quién gritaba y quién lloraba en silencio detrás de una puerta cerrada. Piensa en esa niña que eras tú, sentada en algún rincón de la casa, escuchando lo que no debería haber escuchado, sintiendo lo que no debería haber sentido, aprendiendo que el amor duele. Que el amor viene y se va. Que para ser amada hay que aguantar. Que si te portas bien, quizás te quieran. Que si eres lo suficientemente buena, lo suficientemente callada, lo suficientemente invisible, quizás se queden. Quizás no se vayan. Quizás esta vez sea diferente.

Esa niña sigue dentro de ti. Y cada vez que él se va y tú sientes ese pánico que te paraliza, no es la mujer adulta la que entra en crisis. Es esa niña. Esa niña de cinco años, de siete, de diez, que aprendió que el abandono es lo peor que puede pasar en el mundo. Esa niña que hará lo que sea, absolutamente lo que sea, para que no la dejen. Aunque eso signifique perderse a sí misma.

Y eso es exactamente lo que ha pasado. Te has perdido. ¿Cuándo fue la última vez que hiciste algo solo porque tú querías? ¿Cuándo fue la última vez que te reíste sin que él tuviera nada que ver? No sabes quién eres fuera de él. No recuerdas qué te gustaba antes de conocerlo. No sabes qué quieres. No sabes qué sientes. A veces no sientes nada. Absolutamente nada. Como si estuvieras en automático. Como si alguien hubiera apagado un interruptor dentro de ti y no supieras cómo volver a encenderlo. Eso se llama apagón emocional. Es cuando tu sistema nervioso ya no puede más. Cuando ya no puede seguir en modo alarma permanente, simplemente se apaga. Colapsa. Es el último recurso de tu cuerpo para sobrevivir. Y tú llevas meses, quizás años, sobreviviendo.

Pero sobrevivir no es vivir. Y tú no viniste a este mundo a sobrevivir una relación que te consume. Viniste a vivir. Y para vivir, necesitas entender qué te pasó, por qué te pasó, y qué puedes hacer para salir. No con frases bonitas. No con afirmaciones frente al espejo. No con fuerza de voluntad que se agota a los tres días. Con conocimiento real. Con herramientas reales. Con alguien que entienda exactamente lo que te pasa porque ha visto a cientos de mujeres pasar por donde tú estás y salir del otro lado.

Eso es lo que hago. Y eso es lo que te ofrezco con Apego Detox. No te voy a mentir diciendo que es fácil. No lo es. Pero sí te voy a decir algo que es verdad y que necesitas escuchar: se puede. Se puede salir. Se puede romper el patrón. Se puede desintoxicar el cerebro de esa persona. Y yo te puedo enseñar cómo. Paso a paso. Sin juicio. Sin prisa. Pero con la verdad que necesitas escuchar aunque duela. Porque la verdad duele, pero la mentira te destruye.

Apego Detox son 8 módulos completos, 32 capítulos, terapia en vivo dos veces por semana por Google Meet conmigo, un grupo de WhatsApp con mujeres que entienden lo que vives porque lo viven también, y acompañamiento 24/7. Todo por 25 dólares. No es un error. Son 25 dólares. Porque yo no quiero que el dinero sea la razón por la que sigas atrapada. Ya tienes suficientes cadenas. El precio no va a ser una más.

Lo único que tienes que hacer es entrar a historiasdelamente.com/apegodetox. Ahí está todo. Ahí empieza todo. El acceso es inmediato. En el momento que tomas la decisión, empiezas. No mañana. No la semana que viene. No cuando te sientas lista. Ahora. Porque cada día que pasa en ese ciclo es un día más que pierdes de la vida que te mereces. Y tú ya has perdido demasiados días."""
})

# ═══════════════════════════════════════════════════════════════
# PARTE 2: ESTO ES LO QUE ÉL TE HIZO (~12,500 chars)
# ═══════════════════════════════════════════════════════════════
parts.append({
    "num": 2,
    "title": "Esto es lo que él te hizo — Y no fue tu culpa",
    "body": """Quiero que hagas algo conmigo ahora mismo. Quiero que cierres los ojos un momento y pienses en la última vez que lloraste por él. No la última vez que lloraste en general. La última vez que lloraste por él específicamente. ¿Dónde estabas? ¿Qué hora era? ¿Estabas sola? Apuesto lo que quieras a que estabas sola. Apuesto a que estabas en tu cuarto con la puerta cerrada, o en el baño para que nadie te escuchara, o en tu carro después del trabajo sin poder arrancarlo porque no te dejaban de temblar las manos y la vista se te nublaba de tanto llorar. Apuesto a que tenías el teléfono cerca. Siempre lo tienes cerca. Por si acaso. Por si él escribe. Por si él cambia de opinión. Por si esta vez es diferente.

No fue diferente. Nunca es diferente. Y en el fondo lo sabes. Pero hay una parte de ti, una parte pequeña pero tremendamente poderosa, que se aferra a la posibilidad. Al uno por ciento de esperanza que te mantiene enganchada como un anzuelo en la garganta. Esa esperanza no es tu aliada. Esa esperanza es tu cadena más fuerte. Porque mientras sigas creyendo que puede cambiar, no vas a poder soltar. Y él lo sabe. Él sabe exactamente qué decirte, en qué tono, con qué mirada, para reactivar esa esperanza. Un te extraño susurrado a medianoche. Un perdóname, voy a cambiar dicho con los ojos húmedos. Un beso en la frente después de días de hielo. Y tu cuerpo entero se inunda de alivio. De oxitocina. De esa falsa sensación de que por fin todo va a estar bien. Pero no va a estar bien. Nunca está bien. Porque lo que viene después de cada reconciliación siempre es peor que lo que vino antes. Siempre. Y tú lo sabes. Pero tu cuerpo no te deja actuar con lo que sabes.

Déjame decirte exactamente qué te hizo. No lo que tú crees que te hizo. Lo que realmente te hizo. Porque parte de su trabajo, parte de lo que él hace con una precisión que da miedo, es distorsionar tu realidad hasta que tú misma no sabes qué pasó, qué fue real, qué imaginaste y qué inventó él para hacerte sentir que tú eras el problema.

Te hizo creer que el problema eras tú. Te dijo de mil formas diferentes, con palabras y con silencios, con miradas y con ausencias, que si tú fueras menos sensible, menos celosa, menos intensa, menos necesitada, menos exigente, él no reaccionaría así. Te convenció de que su enojo era tu culpa. De que sus gritos eran porque tú lo provocabas. De que si te ignoraba era porque tú no le dabas espacio. De que si buscaba a otra era porque tú no le dabas lo suficiente. Y tú le creíste. No porque seas ingenua. No porque seas tonta. Sino porque cuando alguien que supuestamente te ama te repite algo suficientes veces, con suficiente convicción, mirándote a los ojos, tu cerebro lo registra como verdad. Se llama gaslighting. Y es una de las formas más crueles de abuso psicológico que existen. Porque no te deja marcas en el cuerpo. Te las deja en el alma. Te las deja en esa voz interior que ahora dice quizás tiene razón y soy yo la del problema cada vez que algo sale mal.

Te hizo perder a tu gente. Piensa en las amigas que tenías antes de él. Piensa en tu familia. Piensa en las personas que te querían, que te cuidaban, que te decían la verdad aunque no quisieras escucharla, y que poco a poco dejaste de ver. Porque él te fue aislando. No de golpe. No con una orden directa. Despacio. Con quejas sutiles. Tu amiga no le caía bien. Tu mamá era muy metida. Tu hermana era una exagerada. Tu compañera de trabajo le parecía una mala influencia. Y tú, para mantener la paz, para evitar otra pelea, para no darle motivos, para que no se enojara, fuiste cerrando puertas. Una por una. Hasta que un día miraste alrededor y te diste cuenta de que estabas completamente sola. Solo él. Solo tú y él en una burbuja que desde afuera parece una relación intensa y desde adentro es una cárcel. Y eso no fue casualidad. Fue diseño. Fue estrategia. Porque una mujer aislada es una mujer que no tiene a dónde ir cuando quiere irse. Una mujer sin red es una mujer que depende completamente de quien la tiene atrapada.

Te hizo dudar de ti misma hasta un punto que no puedes explicarle a nadie. Antes de él, tenías opiniones y las defendías. Tenías gustos que eran tuyos. Tenías una forma de vestir, de hablar, de pensar, de reír que era completamente tuya. Ahora no estás segura de nada. No confías en tu juicio. No confías en tu percepción de la realidad. Si él dice que no pasó, quizás no pasó. Si él dice que estás loca, quizás estás loca. Si él dice que nadie te va a aguantar como él te aguanta, quizás tiene razón. Esa duda constante, esa sensación aterradora de no poder confiar en tu propia mente, de no saber si lo que recuerdas realmente pasó, es el resultado directo de años de manipulación sistemática. No estás loca. Nunca estuviste loca. Te hicieron creer que lo estabas para que dejaras de confiar en ti misma. Porque una mujer que no confía en sí misma es una mujer que no se va.

Te hizo sentir que sin él no eres nada. Y esa es quizás la mentira más grande y más devastadora que te vendió. Porque antes de él, tú eras alguien. Tenías sueños. Tenías planes. Tenías una vida que era tuya y de nadie más. Tenías esa chispa en los ojos que ahora cuando te miras al espejo no puedes encontrar. Pero él fue borrando todo eso. Poco a poco. Como quien borra un dibujo a lápiz, pasando el borrador tantas veces que al final ya no queda ni la marca en el papel. Tu identidad, tus gustos, tus ambiciones, tu risa, tu forma de caminar por el mundo con la frente en alto, todo eso fue desapareciendo. Y ahora cuando piensas en dejarlo, sientes un vacío tan grande, tan oscuro, tan profundo, que te da más miedo que el dolor de quedarte. Prefiero el dolor conocido que el vacío desconocido. Y él lo sabe. Él cuenta con ese vacío para que vuelvas cada vez que intentas irte.

Te hizo creer que el amor duele. Que los celos son prueba de amor. Que la intensidad es pasión. Que si no duele no es real. Que las peleas seguidas de reconciliaciones apasionadas son señal de una conexión profunda que nadie más va a darte. Mentira. Todo mentira. El amor no duele. El amor no te quita el sueño noche tras noche. El amor no te hace revisar un teléfono a las tres de la mañana con las manos temblando y el estómago revuelto. El amor no te hace sentir que caminas sobre vidrios. Eso no es amor. Eso es adicción disfrazada de amor. Y como toda adicción, mientras más consumes, más necesitas, y más te destruye por dentro.

Y ahora viene la parte más difícil de escuchar. La parte que una parte de ti no quiere leer. Él no va a cambiar. No. Escúchame bien porque esto es importante. Él no va a cambiar. No porque sea un monstruo. No porque sea malvado. Sino porque el patrón que él tiene es tan profundo como el tuyo. Pero con una diferencia crucial y definitiva: tú estás aquí. Tú estás leyendo esto a estas horas. Tú estás buscando respuestas. Tú estás tratando de entender qué te pasa. Él no está haciendo nada de eso. Él no está buscando ayuda. Él no cree que tenga un problema. Porque en su mundo, el problema eres tú. Siempre fuiste tú. Y mientras él no reconozca que tiene un problema, mientras él no busque cambiar activamente con ayuda profesional, no va a cambiar. Puedes quedarte cinco años más esperando ese cambio. Diez. Veinte. Y el ciclo va a ser exactamente el mismo. Pelea. Silencio. Angustia. Reconciliación. Luna de miel. Y vuelta a empezar. Cada vez más corto el ciclo. Cada vez más intenso el dolor. Cada vez más difícil reconocerte.

¿Qué haces entonces? ¿Te quedas esperando un milagro que no va a llegar? ¿Sigues dándole tu juventud, tu energía, tu salud mental, tus mejores años a alguien que te toma y te suelta cuando quiere como si fueras un juguete? ¿O decides, hoy, ahora, en este momento, que ya fue suficiente?

No te estoy pidiendo que lo dejes mañana. No te estoy pidiendo que hagas nada que no estés lista para hacer. Te estoy pidiendo algo mucho más pequeño pero mucho más poderoso que todo eso: que te entiendas. Que entiendas qué te pasa y por qué te pasa. Que entiendas por qué tu cuerpo reacciona como reacciona. Que entiendas por qué vuelves aunque no quieras volver. Que entiendas que no estás rota ni dañada ni loca. Que estás respondiendo a un programa que alguien instaló en ti sin tu permiso, probablemente cuando eras una niña que no tenía cómo defenderse.

Y te estoy ofreciendo la forma de desinstalar ese programa. Apego Detox es exactamente eso. No es un libro de frases motivacionales que se olvidan al día siguiente. No es alguien diciéndote ámate a ti misma como si fuera tan fácil como encender una luz. Es un programa de 8 módulos, 32 capítulos, creado por un psicólogo especialista que ha trabajado con mujeres que estaban exactamente donde tú estás. Mujeres que creían con todo su ser que no podían salir. Mujeres que habían vuelto diez, veinte, treinta veces. Mujeres que se sentían tan perdidas que no sabían ni quiénes eran cuando se miraban al espejo. Y salieron. Cada una a su ritmo. Cada una con su proceso. Pero salieron.

¿Sabes qué tienen en común todas las mujeres que han logrado romper el ciclo? No es fuerza de voluntad. No es que encontraron a alguien mejor. No es que un día mágicamente dejaron de sentir. Es que entendieron. Entendieron qué les pasaba a nivel neurológico. Entendieron el mecanismo que las tenía atrapadas. Entendieron que no era amor, era cortisol. Entendieron que no era debilidad, era neurología. Y cuando entiendes, cuando realmente entiendes con tu cabeza y con tu cuerpo qué te está pasando, empiezas a ver las cosas de una forma completamente diferente. Empiezas a reconocer el ciclo antes de que te atrape. Empiezas a sentir las señales de tu cuerpo y en vez de obedecerlas ciegamente, las cuestionas. Empiezas a tener poder sobre algo que antes te controlaba por completo.

25 dólares. Eso es lo que cuesta empezar a recuperar tu vida. 25 dólares. Terapia en vivo dos veces por semana. Grupo de WhatsApp con mujeres que entienden. Acompañamiento 24/7. Acceso inmediato. Menos de lo que gastas en una cena que terminas cancelando porque él te arruinó el día. Menos de lo que cuesta ese café que te compras para sobrevivir la mañana después de no haber dormido llorando.

Entra a historiasdelamente.com/apegodetox. Hazlo ahora. No mañana. No cuando te sientas lista. No cuando él te haga algo peor. Ahora. Porque tú ya sabes. Tu corazón ya decidió. Y el simple hecho de que estés leyendo esto me dice que una parte de ti, la parte más valiente que tienes, ya eligió algo diferente. Escúchala. Es la parte que va a salvarte."""
})

# ═══════════════════════════════════════════════════════════════
# PARTE 3: TU NUEVA VIDA EMPIEZA HOY (~12,500 chars)
# ═══════════════════════════════════════════════════════════════
parts.append({
    "num": 3,
    "title": "Tu nueva vida empieza hoy — Y tú puedes hacerlo",
    "body": """Voy a pedirte algo que quizás no has hecho en mucho tiempo. Quizás en meses. Quizás en años. Quiero que pienses en ti. No en él. No en lo que él hizo o dejó de hacer. No en lo que él dijo la última vez que pelearon. No en si va a escribir hoy. No en si va a cambiar esta vez. En ti. Solo en ti. ¿Cuándo fue la última vez que pensaste en ti sin que fuera en relación a él? ¿Cuándo fue la última vez que te hiciste una pregunta tan simple como qué quiero yo? No qué quiere él. No qué necesita la relación. No qué tengo que hacer para que funcione. Tú. ¿Qué quieres tú?

Probablemente no puedes contestar eso ahora mismo. Y eso no es tu culpa. Es lo que hace el vínculo traumático. Te borra. Te diluye. Te convierte en un satélite que gira alrededor de otra persona sin órbita propia. Tu vida entera se organiza en función de él. Tu humor depende de si él está bien contigo o no. Tu día entero se define por si te escribió o no te escribió, por si te contestó con un punto o con un emoji, por si su tono era frío o cálido. Tu valor como persona, tu sensación de estar bien o estar mal, sube o baja dependiendo de cómo te trata ese día. Un día eres la mujer más feliz del mundo porque te dijo algo bonito. Al día siguiente sientes que no vales nada porque te ignoró. Eso no es una relación. Eso es una montaña rusa emocional diseñada para mantenerte mareada, confundida y dependiente. Es una cárcel con la puerta abierta en la que tú eliges quedarte porque afuera te da más miedo que adentro.

Pero afuera es donde está tu vida. Tu vida real. La que te robaron sin que te dieras cuenta. La que tú misma fuiste dejando de lado porque creíste que él era más importante que tú. Y no lo es. No lo fue nunca. Lo que pasa es que tu cerebro te convenció de que sí, porque cuando eres niña y aprendes que para recibir amor tienes que sacrificarte, tu cerebro crea un esquema profundo que dice mi valor depende de que alguien me elija. Y ese esquema se convierte en el lente a través del cual ves todas tus relaciones adultas. No es que eligieras mal conscientemente. No es que seas masoquista. No es que te guste sufrir. Es que tu detector de parejas está calibrado al revés. Está programado para confundir el peligro con la pasión, la ansiedad con el amor, y la indiferencia con la seguridad. Lo que te genera mariposas en el estómago no es conexión. Es alarma. Tu cuerpo reconoce el patrón de tu infancia y dice esto se siente familiar, esto debe ser amor. Pero no es amor. Es repetición.

Voy a decirte algo que probablemente te va a doler. Pero necesitas escucharlo y necesitas escucharlo de alguien que te lo dice porque le importas, no porque quiera herirte. Mientras sigas en ese ciclo, no solo te estás destruyendo a ti. Estás enseñándole a la gente que te rodea que eso es normal. Si tienes una hija, ella está viendo. Está viendo cómo su mamá llora por las noches. Está viendo cómo su mamá cambia de humor dependiendo de una llamada. Está viendo cómo su mamá se achica cuando él grita y se ilumina cuando él es amable. Y está aprendiendo que eso es el amor. Si tienes una hermana menor, ella está viendo. Si tienes amigas, están viendo. Y lo que ven, aunque tú no quieras, es que una mujer inteligente, capaz y valiosa puede vivir así. Puede aceptar eso. Y sin quererlo, sin darte cuenta, estás sembrando en ellas la semilla del mismo patrón que te destruyó a ti. No te digo esto para culparte. No te digo esto para hacerte sentir peor. Te digo esto para que entiendas que tu decisión de sanar no te afecta solo a ti. Tu sanación no es solo tuya. Es de todas las mujeres que te miran y aprenden de ti. Cuando tú sanas, sanan todas las que vienen después.

¿Te acuerdas de esa niña que eras antes de que el mundo te enseñara que el amor duele? Esa niña que se reía sin miedo, que corría sin calcular, que soñaba sin pedir permiso, que no necesitaba la validación de absolutamente nadie para sentirse valiosa, que se miraba al espejo y se gustaba sin pensarlo dos veces. Esa niña sigue ahí. Está escondida detrás de capas y capas de dolor que no le pertenecen. Está asustada. Está callada. Pero está viva. Está esperando que alguien la rescate. Y ese alguien no es él. No es un hombre nuevo. No es una pareja mejor. No es alguien que venga a completarte porque tú no estás incompleta. Eres tú. La mujer adulta que llevas dentro tiene toda la capacidad de ir a buscar a esa niña, abrazarla, y decirle lo que nadie le dijo cuando más lo necesitaba: ya no tienes que aguantar más. Ya no tienes que quedarte callada para que te quieran. Ya no tienes que ser perfecta para merecer amor. Ya no tienes que sacrificarte para que alguien se quede. Te quiero yo. Y voy a cuidarte yo. A partir de hoy.

Ese es el trabajo más profundo y más transformador que existe en psicología. Y es exactamente lo que hacemos en el Módulo 4 de Apego Detox: Hablando con mi niña interior. No es una meditación guiada de YouTube. No es cerrá los ojos e imaginá una luz blanca. No es repetí afirmaciones frente al espejo. Es un trabajo psicológico real, profundo, guiado por un profesional, donde vas a entender de dónde viene tu patrón, cuándo se instaló, quién te lo enseñó, y vas a empezar a reescribirlo. Porque no puedes cambiar lo que no entiendes. Y no puedes soltar lo que no has procesado. Mientras esa niña interior siga herida y asustada, va a seguir eligiendo por ti. Va a seguir corriendo hacia quien le prometa que no la va a dejar, aunque esa promesa sea mentira.

Ahora déjame hablarte con total claridad de lo que pasa cuando decides entrar a Apego Detox. Porque quiero que sepas exactamente qué te espera. Sin adornos. Sin promesas vacías. La realidad.

Desde el momento que entras, tienes acceso inmediato a 8 módulos con 32 capítulos. Cada módulo ataca una pieza diferente del rompecabezas de tu dolor. El Módulo 1 te explica qué es el apego emocional. Por primera vez en tu vida vas a entender qué le pasó a tu cerebro y por qué no es tu culpa. El Módulo 2 te lleva a la raíz de todo. A tu infancia. A cuando tu cuerpo aprendió a sobrevivir sin amor y se programó para buscar lo que duele. El Módulo 3 te muestra la psicología cognitiva de tu trampa. Los sesgos, los heurísticos, las profecías autocumplidas que te mantienen atrapada sin que lo sepas. El Módulo 4 es el que te cambia la vida: Hablando con mi niña interior. El trabajo más profundo. El que realmente lo cambia todo porque va a la raíz. El Módulo 5 te explica por qué defiendes a quien te destruye. Tu cerebro te está mintiendo y es hora de pararlo. El Módulo 6 te hace la pregunta que duele: por qué Rapunzel podía escapar pero no lo hizo, y por qué tú tampoco puedes irte aunque la puerta esté abierta. El Módulo 7 te da los 8 pasos que salvan vidas. Qué hacer exactamente, paso por paso, cuando él te escribe de nuevo a las dos de la mañana y sientes que todo tu cuerpo quiere responder. Es tu protocolo de emergencia. Y el Módulo 8 te ayuda a entender el vínculo que no puedes romper y te enseña cómo aflojarlo hasta que puedas soltarlo.

Pero Apego Detox no es solo módulos que ves sola en tu cuarto. Es terapia en vivo. Dos veces por semana. Por Google Meet. Conmigo. No estás viendo videos pregrabados sintiéndote más sola que antes. Estás en sesión en vivo. Con otras mujeres que están pasando por lo mismo. Hablando. Procesando. Llorando si necesitas llorar. Preguntando lo que nunca te atreviste a preguntar. Entendiendo cosas que cambian tu forma de verte a ti misma. Es un espacio donde no tienes que fingir que estás bien. Donde puedes decir volví con él otra vez sin que nadie te mire con lástima, sin que nadie te diga ya te lo dije, sin que nadie te juzgue. Donde tu proceso es respetado tal como es. Donde avanzas a tu ritmo. Pero donde no avanzas sola. Nunca más sola.

Y además tienes el grupo de WhatsApp. Una comunidad de mujeres que están caminando el mismo camino que tú. Que entienden lo que sientes porque lo sienten en su propio cuerpo. Que a las tres de la mañana, cuando él te escribe y sientes que todo tu mundo se desmorona, están ahí. No con consejos baratos. No con frases de cajón. Con presencia real. Con compañía real. Con la fuerza que da saber que no eres la única mujer en el mundo que pasa por esto. Porque parte de lo que hace el abuso emocional es hacerte creer que eres la única. Que nadie entiende. Que tu caso es especial. Y cuando entras a esa comunidad y ves que hay decenas de mujeres más viviendo lo mismo, algo se rompe adentro. Algo bueno. Se rompe el aislamiento. Se rompe la vergüenza. Se rompe la mentira de que estás sola en esto. Y en su lugar aparece algo que quizás hace mucho no sentías: pertenencia. La sensación de que hay un lugar donde puedes ser tú, con todo tu dolor, con todo tu proceso, y ser recibida sin condiciones.

25 dólares. Veinticinco dólares es lo que cuesta todo esto. Es lo que cuesta empezar a entenderte. Es lo que cuesta dejar de sentirte loca. Es lo que cuesta empezar a recuperar a la mujer que eras antes de que él llegara a borrarte el alma. Yo tomé esa decisión consciente de poner ese precio. La tomé porque sé que muchas de ustedes están en situaciones económicas difíciles. Porque sé que algunas dependen económicamente de él, lo cual es otra cadena más. Porque sé que hay mujeres que quisieran ir a terapia pero no pueden pagarla. Entonces quité esa barrera. La quité completamente. Porque lo que me importa no es el dinero. Lo que me importa es que tú salgas de donde estás. Lo que me importa es que dentro de seis meses puedas mirar atrás y decir ahí fue cuando empezó todo. Ahí fue cuando decidí que ya era suficiente.

Ahora te voy a decir algo y quiero que lo escuches con todo tu ser, con cada célula de tu cuerpo, con esa parte de ti que todavía cree que es posible algo mejor. Tú puedes hacer esto. Sí, tú. La que cree que no puede. La que ha vuelto treinta veces y se odia por cada una. La que siente que ya no tiene fuerza ni para levantarse de la cama. La que piensa que su caso es diferente, que ella es la excepción, que con ella no va a funcionar nada. No eres la excepción. Eres la regla. Y la regla dice que cuando una mujer entiende lo que le pasa, empieza a cambiar. No mágicamente. No de la noche a la mañana. Pero real. Profunda. Irreversiblemente.

Cada mujer que ha salido de un vínculo traumático empezó exactamente donde tú estás ahora. Con miedo. Con dudas. Con el teléfono en la mano a las tres de la mañana y el corazón hecho pedazos. La diferencia entre las que salieron y las que siguen atrapadas cinco años después no es fuerza. No es suerte. No es que tuvieron menos dolor o más recursos. Es que tomaron una decisión. Una sola decisión. La decisión de decir no sé cómo salir de esto, pero voy a aprender. La decisión de elegirse a sí mismas por primera vez en su vida.

Esa decisión te la estoy poniendo enfrente ahora mismo. historiasdelamente.com/apegodetox. Es una página. Es un click. Es 25 dólares. Es el momento exacto en que tu historia deja de repetirse y empieza a cambiar de dirección. No es el final del dolor. Ojalá pudiera prometerte eso, pero no te voy a mentir. Es el principio de entenderlo. Y cuando entiendes tu dolor, cuando lo miras de frente, cuando le pones nombre y apellido y entiendes de dónde viene y por qué te tiene atrapada, dejas de ser su esclava y te conviertes en su maestra. Dejas de reaccionar automáticamente y empiezas a elegir conscientemente. Dejas de sobrevivir y empiezas, por fin, a vivir.

Yo voy a estar ahí cuando entres. Las mujeres de la comunidad van a estar ahí. Tus 8 módulos van a estar esperándote. Tu terapia en vivo va a estar ahí dos veces por semana. Tu acompañamiento 24/7 va a estar ahí para cuando más lo necesites. Lo único que falta eres tú. Y yo creo en ti. Creo en ti más de lo que tú crees en ti misma en este momento. Porque he visto a mujeres que estaban más hundidas, más rotas, más perdidas que tú, levantarse. He visto a mujeres que juraban que no podían, poder. He visto a mujeres que le habían dado absolutamente todo a alguien que no las merecía, recuperar cada pedazo de sí mismas y construir algo más hermoso de lo que tenían antes.

Esa mujer puedes ser tú. No mañana. Hoy. El cambio no empieza cuando te sientes lista. Nadie se siente lista para esto. El cambio empieza cuando decides que estás harta de esperar a sentirte lista. Y algo me dice que tú ya estás ahí. Algo me dice que llevas tiempo ahí, esperando una señal, esperando que alguien te diga lo que te voy a decir ahora mismo: tienes permiso. Tienes permiso para elegirte a ti por encima de él. Tienes permiso para soltar sin culpa. Tienes permiso para sanar sin prisa. Tienes permiso para ser feliz sin que esa felicidad dependa de otro ser humano. Tienes permiso para empezar de nuevo las veces que necesites. Tienes permiso para ser la mujer que siempre debiste ser pero que alguien te convenció de que no podías.

historiasdelamente.com/apegodetox. El acceso es inmediato. Tu nueva vida te está esperando al otro lado de esa decisión. Y tú ya la mereces. Siempre la mereciste. Desde el primer día."""
})

# ─── Document ───
doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    topMargin=0.7 * inch,
    bottomMargin=0.7 * inch,
    leftMargin=0.85 * inch,
    rightMargin=0.85 * inch,
)

styles = getSampleStyleSheet()

# ─── Custom styles ───
styles.add(ParagraphStyle(
    name='CoverTitle',
    fontSize=28,
    leading=34,
    alignment=TA_CENTER,
    textColor=GOLD,
    spaceAfter=12,
    fontName='Helvetica-Bold',
))

styles.add(ParagraphStyle(
    name='CoverSubtitle',
    fontSize=14,
    leading=18,
    alignment=TA_CENTER,
    textColor=MEDIUM_GRAY,
    spaceAfter=6,
    fontName='Helvetica',
))

styles.add(ParagraphStyle(
    name='CoverInfo',
    fontSize=11,
    leading=14,
    alignment=TA_CENTER,
    textColor=LIGHT_GRAY,
    spaceAfter=4,
    fontName='Helvetica',
))

styles.add(ParagraphStyle(
    name='PartTitle',
    fontSize=20,
    leading=26,
    alignment=TA_LEFT,
    textColor=DARK_RED,
    spaceBefore=10,
    spaceAfter=20,
    fontName='Helvetica-Bold',
))

styles.add(ParagraphStyle(
    name='PartNumber',
    fontSize=11,
    leading=14,
    alignment=TA_LEFT,
    textColor=GOLD,
    spaceBefore=0,
    spaceAfter=4,
    fontName='Helvetica-Bold',
))

styles.add(ParagraphStyle(
    name='BodyText2',
    fontSize=11.5,
    leading=17,
    alignment=TA_JUSTIFY,
    textColor=DARK_TEXT,
    spaceAfter=10,
    fontName='Helvetica',
    firstLineIndent=0,
))

styles.add(ParagraphStyle(
    name='CharCount',
    fontSize=9,
    leading=12,
    alignment=TA_LEFT,
    textColor=LIGHT_GRAY,
    spaceAfter=2,
    fontName='Helvetica-Oblique',
))

# ─── Build story ───
story = []

# Cover page
story.append(Spacer(1, 2 * inch))
story.append(Paragraph("CTA EMOCIONAL", styles['CoverTitle']))
story.append(Paragraph("Apego Detox — Directo al Corazón", styles['CoverTitle']))
story.append(Spacer(1, 0.4 * inch))
story.append(Paragraph("3 Partes — Venta emocional profunda", styles['CoverSubtitle']))
story.append(Spacer(1, 0.6 * inch))
story.append(Paragraph("Javier Vieira — Psicólogo Especialista (COLPSIC 293219)", styles['CoverInfo']))
story.append(Paragraph("Historias de la Mente — @historias.de.la.mente", styles['CoverInfo']))
story.append(Spacer(1, 0.3 * inch))

total_chars = sum(len(p["body"]) for p in parts)
story.append(Paragraph(f"Total: {total_chars:,} caracteres | {len(parts)} partes", styles['CoverInfo']))
story.append(PageBreak())

# ─── Each part ───
for p in parts:
    chars = len(p["body"])

    # Part header
    story.append(Paragraph(f"PARTE {p['num']} DE 3", styles['PartNumber']))
    story.append(Paragraph(p["title"], styles['PartTitle']))
    story.append(Paragraph(f"{chars:,} caracteres", styles['CharCount']))
    story.append(HRFlowable(
        width="100%", thickness=1,
        color=GOLD, spaceAfter=15, spaceBefore=5
    ))

    # Body paragraphs
    paragraphs = p["body"].split("\n\n")
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        para = para.replace("\n", " ")
        para = para.replace("&", "&amp;")
        para = para.replace("<", "&lt;")
        para = para.replace(">", "&gt;")
        story.append(Paragraph(para, styles['BodyText2']))

    # Page break between parts
    story.append(PageBreak())

# ─── Build PDF ───
print("Generating PDF...")
doc.build(story)
print(f"PDF generated: {output_path}")
print(f"Total parts: {len(parts)}")
for p in parts:
    print(f"  Parte {p['num']}: {len(p['body']):,} caracteres - {p['title']}")
print(f"Total characters: {total_chars:,}")
