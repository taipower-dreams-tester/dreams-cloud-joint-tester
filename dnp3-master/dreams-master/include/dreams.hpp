#ifndef DREAMS_HPP
#define DREAMS_HPP

#include "Point.hpp"
#include <vector>

using dreams::Point;
using std::vector;

namespace dreams {

class DreamsPoints {
protected:
    std::vector<dreams::Point*> points;
public:
    ~DreamsPoints(){ for (auto p : points) { delete p; } }
    const vector<Point *> getPoints() { return points; }
};

class DreamsGridPoints : public DreamsPoints {
public:
    DreamsGridPoints();
};

class DreamsEnergyStoragePoints : public DreamsPoints {
public:
    DreamsEnergyStoragePoints();
};

}
#endif
