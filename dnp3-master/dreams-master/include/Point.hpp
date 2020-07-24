#ifndef DREAMS_POINT_FROM_DATA_HPP
#define DREAMS_POINT_FROM_DATA_HPP

#include <string>

using std::string;

namespace dreams {

class Point {
public:
  Point(
    const float ratio,
    const char *field,
    const bool ctRatio = false,
    const bool ptRatio = false
  ) : field(field), ratio(ratio), ctRatio(ctRatio), ptRatio(ptRatio) {};

  const string field;
  const float ratio;
  const bool ctRatio;
  const bool ptRatio;
};

}

#endif  // DREAMS_POINT_FROM_DATA_HPP
