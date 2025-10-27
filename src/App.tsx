import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "./index.css";

export function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordings, setRecordings] = useState<{ blob: Blob; name: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getStream = (deviceId?: string) => {
    console.log("Getting stream for device:", deviceId);
    const constraints: MediaStreamConstraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : true,
      audio: true,
    };
    console.log("Constraints:", constraints);
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((s) => {
        console.log("Stream obtained:", s);
        setStream(s);
        // Re-enumerate to get labels now that permission granted
        navigator.mediaDevices.enumerateDevices().then((deviceList) => {
          const videoDevices = deviceList.filter((device) => device.kind === "videoinput");
          setDevices(videoDevices);
          if (videoDevices.length > 0 && !selectedDeviceId) {
            const firstDevice = videoDevices.find(d => d.deviceId) || videoDevices[0]!;
            setSelectedDeviceId(firstDevice.deviceId);
          }
        });
      })
      .catch((err) => {
        console.error("getUserMedia error:", err);
        setStream(null);
      });
  };

  useEffect(() => {
    console.log("Enumerating devices...");
    navigator.mediaDevices.enumerateDevices().then((deviceList) => {
      console.log("Device list:", deviceList);
      const videoDevices = deviceList.filter((device) => device.kind === "videoinput");
      console.log("Video devices:", videoDevices);
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        const firstDevice = videoDevices[0]!;
        if (firstDevice.deviceId) {
          setSelectedDeviceId(firstDevice.deviceId);
        } else {
          // If deviceId empty, get stream without constraint
          getStream();
        }
      } else if (videoDevices.length === 0) {
        // No devices, try anyway
        getStream();
      }
    }).catch((err) => console.error("Enumerate devices error:", err));
  }, []);

  useEffect(() => {
    if (selectedDeviceId) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      getStream(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    console.log("Stream changed:", stream);
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      console.log("Set srcObject to video element");
    }
  }, [stream]);

  const startRecording = () => {
    console.log("Starting recording, stream:", stream);
    if (!stream) return;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const name = `Recording ${recordings.length + 1}`;
      setRecordings((prev) => [...prev, { blob, name }]);
      setTimeLeft(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    mediaRecorder.start();
    setIsRecording(true);
    setTimeLeft(10);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);
    timeoutRef.current = setTimeout(() => {
      mediaRecorder.stop();
      setIsRecording(false);
    }, 10000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };



  const downloadRecording = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-8">
      {devices.length > 1 && (
        <div className="mb-4 flex justify-center">
          <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select webcam" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        className="border rounded-lg w-full max-w-md mx-auto"
      />
      <div className="mt-4 flex justify-center gap-4">
        <Button
          onClick={startRecording}
          disabled={isRecording || !stream}
        >
          {isRecording ? `Recording... ${timeLeft}s` : "Record 10s Message"}
        </Button>
        {isRecording && (
          <Button onClick={stopRecording} variant="destructive">
            Stop Recording
          </Button>
        )}
      </div>
      {recordings.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recordings</h2>
          <div className="space-y-4">
            {recordings.map((recording, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium">{recording.name}</h3>
                <video
                  src={URL.createObjectURL(recording.blob)}
                  controls
                  className="w-full max-w-md mx-auto mt-2"
                />
                <div className="flex justify-center mt-2">
                  <Button onClick={() => downloadRecording(recording.blob, recording.name)}>Download</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
