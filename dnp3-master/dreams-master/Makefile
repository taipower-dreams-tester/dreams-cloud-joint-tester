CXX		  := g++
CXX_FLAGS := -Wall -Wextra -std=c++17 -ggdb

BIN		:= bin
SRC		:= src
INCLUDE	:= include
LIB		:= lib

LIBRARIES	:= -l asiodnp3 -l asiopal -l opendnp3 -l openpal -lrabbitmq -lcurl -pthread
SENDER_LIBRARIES := -lboost_program_options
EXECUTABLE	:= dreams-master
SENDER_EXECUTABLE := dreams-msg-sender


all: $(BIN)/$(EXECUTABLE) $(BIN)/$(SENDER_EXECUTABLE)

run: clean all
	clear
	./$(BIN)/$(EXECUTABLE)

$(BIN)/$(EXECUTABLE): $(SRC)/$(EXECUTABLE)/*.cpp
	$(CXX) $(CXX_FLAGS) -I$(INCLUDE) -L$(LIB) $^ -o $@ $(LIBRARIES)

$(BIN)/$(SENDER_EXECUTABLE): $(SRC)/$(SENDER_EXECUTABLE)/*.cpp
	$(CXX) $(CXX_FLAGS) -I$(INCLUDE) -L$(LIB) $^ -o $@ $(SENDER_LIBRARIES)

clean:
	-rm $(BIN)/*

