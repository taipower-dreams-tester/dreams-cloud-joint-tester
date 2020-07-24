#include "utils.hpp"

namespace dreams {

const char *getenv_default(const char *name, const char *default_val) {
  const char *response = getenv(name);
  if (response == NULL) {
    return default_val;
  } else {
    return response;
  }
}

} // namespace dreams