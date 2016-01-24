Bitwig Controller Scripts
========

This is a repository to host custom controller scripts I've written for Bitwig Studio.

## Arturia

### BeatStep Pro

* Separate input channels for each sequencer
    * **Sequencer 1**: MIDI Channel 1
    * **Sequencer 2**: MIDI Channel 2
    * **Drum Sequencer**: MIDI Channel 10
* Macro mappings for selected device on knobs 1-4, 9-12
    * Control mode should use MIDI channel 5 (Change user channel to 5)
    * Knob mode should be set to Relative #1 for all knobs in MIDI Control Center
    * Knobs 1-4 should be mapped to CC 20-23
    * Knobs 9-12 should be mapped to CC 24-27 
* Track selection using step buttons

## Novation

### Launchpad

This is the improved launchpad script copied from [educk/novation-launchpad](https://github.com/educk/novation-launchpad).
