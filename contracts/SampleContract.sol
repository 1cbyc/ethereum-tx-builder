pragma solidity ^0.4.4;

contract SampleContract {

    // Public state variable
    uint256 public value;

    // Function to set the value
    function setValue(uint256 value_) public {
        value = value_;
    }

}