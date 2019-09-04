# Ejercicio 1


P(gusta del programa 1 | joven) = 0.95
P(gusta del programa 2 | joven) = 0.05
P(gusta del programa 3 | joven) = 0.02
P(gusta del programa 4 | joven) = 0.20


P(gusta del programa 1 | viejo) = 0.03
P(gusta del programa 2 | viejo) = 0.82
P(gusta del programa 3 | viejo) = 0.34
P(gusta del programa 4 | viejo) = 0.92

P(viejo) = 0.90
P(joven) = 0.10

Las variables de la edad y programa no son independientes.

Por Teorema de Bayes, P(A | B) = P(B | A).P(A) / P(B)

Para saber si algún oyente es joven o viejo mediante el uso de Bayes, primero debemos saber la probabilidad de que sea joven o viejo tal que escucha un programa determinado.


P(joven | gusta del programa 1) = P(gusta del programa 1 | joven) . P(joven) / P(gusta del programa 1)
P(joven | gusta del programa 2) = P(gusta del programa 2 | joven) . P(joven) / P(gusta del programa 2)
P(joven | gusta del programa 3) = P(gusta del programa 3 | joven) . P(joven) / P(gusta del programa 3)
P(joven | gusta del programa 4) = P(gusta del programa 4 | joven) . P(joven) / P(gusta del programa 4)

P(viejo | gusta del programa 1) = P(gusta del programa 1 | viejo) . P(viejo) / P(gusta del programa 1)
P(viejo | gusta del programa 2) = P(gusta del programa 2 | viejo) . P(viejo) / P(gusta del programa 2)
P(viejo | gusta del programa 3) = P(gusta del programa 3 | viejo) . P(viejo) / P(gusta del programa 3)
P(viejo | gusta del programa 4) = P(gusta del programa 4 | viejo) . P(viejo) / P(gusta del programa 4)


Recordemos que P(A | B) = P(A int B) / P(B)
Por Teorema de la Probabilidad Total, P(B) = Sum(P(B int Ai)) = Sum(P(B|Ai).P(Ai))

P(gusta del programa 1) = P(gusta del programa 1 | joven) * P(joven) + P(gusta del programa 1 | viejo) * P(viejo)
P(gusta del programa 1) = 0.95 * 0.10 + 0.03 * 0.9 = 0.122
P(gusta del programa 2) = P(gusta del programa 2 | joven) * P(joven) + P(gusta del programa 2 | viejo) * P(viejo)
P(gusta del programa 2) = 0.05 * 0.10 + 0.82 * 0.9 = 0.743
P(gusta del programa 3) = P(gusta del programa 3 | joven) * P(joven) + P(gusta del programa 3 | viejo) * P(viejo)
P(gusta del programa 3) = 0.02 * 0.10 + 0.34 * 0.9 = 0.308
P(gusta del programa 4) = P(gusta del programa 4 | joven) * P(joven) + P(gusta del programa 4 | viejo) * P(viejo)
P(gusta del programa 4) = 0.20 * 0.10 + 0.92 * 0.9 = 0.848


P(joven | gusta del programa 1) = 0.95 * 0.10 / 0.122 = 0.77868852459
P(joven | gusta del programa 2) = 0.05 * 0.10 / 0.743 = 0.0067294751
P(joven | gusta del programa 3) = 0.02 * 0.10 / 0.308 = 0.00649350649
P(joven | gusta del programa 4) = 0.20 * 0.10 / 0.848 = 0.02358490566

P(viejo | gusta del programa 1) = 0.03 * 0.90 / 0.122 = 0.22131147541
P(viejo | gusta del programa 2) = 0.82 * 0.90 / 0.743 = 0.99327052489
P(viejo | gusta del programa 3) = 0.34 * 0.90 / 0.308 = 0.9935064935
P(viejo | gusta del programa 4) = 0.92 * 0.90 / 0.848 = 0.97641509434

programas = gusta del 1 y del 3 pero no del 2 y del 4.

P(joven | programas) = 0.77868852459 * (1 - 0.0067294751) * 0.00649350649 * (1 - 0.02358490566) = 0.0049039393
P(viejo | programas) = 0.22131147541 * (1 - 0.99327052489) * 0.9935064935 * (1 - 0.97641509434) = 0.00003489715
