#ifndef DREAMS_MASTER_UTILS_HPP
#define DREAMS_MASTER_UTILS_HPP

#include <cstdlib>
using std::getenv;

namespace dreams {

const char *getenv_default(const char *name, const char *default_val);
    
} // namespace dreams 

#endif // DREAMS_MASTER_UTILS_HPP