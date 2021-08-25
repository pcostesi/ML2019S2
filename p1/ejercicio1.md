# Ejercicio 1


P(gusta del programa 1 | estudiante) = 0.95
P(gusta del programa 2 | estudiante) = 0.05
P(gusta del programa 3 | estudiante) = 0.02
P(gusta del programa 4 | estudiante) = 0.20


P(gusta del programa 1 | graduado) = 0.03
P(gusta del programa 2 | graduado) = 0.82
P(gusta del programa 3 | graduado) = 0.34
P(gusta del programa 4 | graduado) = 0.92

P(graduado) = 0.90
P(estudiante) = 0.10

Las variables de la edad y programa no son independientes.

Por Teorema de Bayes, P(A | B) = P(B | A).P(A) / P(B)

Para saber si algún oyente es estudiante o graduado mediante el uso de Bayes, primero debemos saber la probabilidad de que sea estudiante o graduado tal que escucha un programa determinado.


P(estudiante | gusta del programa 1) = P(gusta del programa 1 | estudiante) . P(estudiante) / P(gusta del programa 1)
P(estudiante | gusta del programa 2) = P(gusta del programa 2 | estudiante) . P(estudiante) / P(gusta del programa 2)
P(estudiante | gusta del programa 3) = P(gusta del programa 3 | estudiante) . P(estudiante) / P(gusta del programa 3)
P(estudiante | gusta del programa 4) = P(gusta del programa 4 | estudiante) . P(estudiante) / P(gusta del programa 4)

P(graduado | gusta del programa 1) = P(gusta del programa 1 | graduado) . P(graduado) / P(gusta del programa 1)
P(graduado | gusta del programa 2) = P(gusta del programa 2 | graduado) . P(graduado) / P(gusta del programa 2)
P(graduado | gusta del programa 3) = P(gusta del programa 3 | graduado) . P(graduado) / P(gusta del programa 3)
P(graduado | gusta del programa 4) = P(gusta del programa 4 | graduado) . P(graduado) / P(gusta del programa 4)


Recordemos que P(A | B) = P(A int B) / P(B)
Por Teorema de la Probabilidad Total, P(B) = Sum(P(B int Ai)) = Sum(P(B|Ai).P(Ai))

P(gusta del programa 1) = P(gusta del programa 1 | estudiante) * P(estudiante) + P(gusta del programa 1 | graduado) * P(graduado)
P(gusta del programa 1) = 0.95 * 0.10 + 0.03 * 0.9 = 0.122
P(gusta del programa 2) = P(gusta del programa 2 | estudiante) * P(estudiante) + P(gusta del programa 2 | graduado) * P(graduado)
P(gusta del programa 2) = 0.05 * 0.10 + 0.82 * 0.9 = 0.743
P(gusta del programa 3) = P(gusta del programa 3 | estudiante) * P(estudiante) + P(gusta del programa 3 | graduado) * P(graduado)
P(gusta del programa 3) = 0.02 * 0.10 + 0.34 * 0.9 = 0.308
P(gusta del programa 4) = P(gusta del programa 4 | estudiante) * P(estudiante) + P(gusta del programa 4 | graduado) * P(graduado)
P(gusta del programa 4) = 0.20 * 0.10 + 0.92 * 0.9 = 0.848


P(estudiante | gusta del programa 1) = 0.95 * 0.10 / 0.122 = 0.77868852459
P(estudiante | gusta del programa 2) = 0.05 * 0.10 / 0.743 = 0.0067294751
P(estudiante | gusta del programa 3) = 0.02 * 0.10 / 0.308 = 0.00649350649
P(estudiante | gusta del programa 4) = 0.20 * 0.10 / 0.848 = 0.02358490566

P(graduado | gusta del programa 1) = 0.03 * 0.90 / 0.122 = 0.22131147541
P(graduado | gusta del programa 2) = 0.82 * 0.90 / 0.743 = 0.99327052489
P(graduado | gusta del programa 3) = 0.34 * 0.90 / 0.308 = 0.9935064935
P(graduado | gusta del programa 4) = 0.92 * 0.90 / 0.848 = 0.97641509434

programas = gusta del 1 y del 3 pero no del 2 y del 4.

P(estudiante | programas) = 0.77868852459 * (1 - 0.0067294751) * 0.00649350649 * (1 - 0.02358490566) = 0.0049039393
P(graduado | programas) = 0.22131147541 * (1 - 0.99327052489) * 0.9935064935 * (1 - 0.97641509434) = 0.00003489715
