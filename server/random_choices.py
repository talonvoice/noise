import random
import itertools
import bisect as _bisect

# backported from python 3.6
def choices(population, weights=None, *, cum_weights=None, k=1):
    """Return a k sized list of population elements chosen with replacement.
    If the relative weights or cumulative weights are not specified,
    the selections are made with equal probability.
    """
    if cum_weights is None:
        if weights is None:
            _int = int
            total = len(population)
            return [population[int(random.random() * total)] for i in range(k)]
        cum_weights = list(itertools.accumulate(weights))
    elif weights is not None:
        raise TypeError('Cannot specify both weights and cumulative weights')
    if len(cum_weights) != len(population):
        raise ValueError('The number of weights does not match the population')
    bisect = _bisect.bisect
    total = cum_weights[-1]
    hi = len(cum_weights) - 1
    return [population[bisect(cum_weights, random.random() * total, 0, hi)]
            for i in range(k)]
