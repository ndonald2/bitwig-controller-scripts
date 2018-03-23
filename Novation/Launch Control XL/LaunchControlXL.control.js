loadAPI(1);

host.defineController("Novation", "Launch Control XL", "1.0", "94793080-55fb-11e4-8ed6-0800200c9a66");
host.defineMidiPorts(1, 1);
host.defineSysexIdentityReply('F07E0006020020296100000000000306F7');

load('src/index.js');
load('Colors.js');
load('Layout.js');
load('LaunchControlXL.js');
load('DrumMachine.js');

var main;

function init()
{
    var noteInput = host.getMidiInPort(0).createNoteInput("Launchpad", "80????", "90????");
    noteInput.setShouldConsumeEvents(false);

    var port = new MidiPort(host, 0);

    var launchControlXL = new LaunchControlXL();
    var drumMachine = new DrumMachine();
    drumMachine.set('active', false);

    main = new ControlGroup([launchControlXL, drumMachine]);
    main.set('midiPort', port);

    port.on('sysex', function (data)
    {
        if (data.matchesHexPattern('F0002029021177??F7'))
        {
            var program = data.hexByteAt(7);
            launchControlXL.set('active', program === 8);
            drumMachine.set('active', program === 0);
        }
    });

}


function exit()
{
    main.onExit();
}



