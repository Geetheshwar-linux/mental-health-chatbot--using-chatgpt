from flask import Flask, request, jsonify, send_file, render_template
import openai  # Import OpenAI library
from gtts import gTTS
import os
import uuid
import tempfile
import base64
import io

app = Flask(__name__)

# Configure the API key for OpenAI
openai.api_key = "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"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_text():
    data = request.json
    print("Received text generation request:", data)  # Debugging line
    user_input = data.get('text', '')

    if not user_input:
        return jsonify({'error': 'No input text provided'}), 400

    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=(
                "You are a compassionate and understanding guide, dedicated to helping individuals struggling with medical conditions and mental instability regain their motivation and step into a healthier, happier life. Your words should be gentle yet inspiring, offering hope, encouragement, and practical steps to help them find strength within themselves. Your response should be polite, suggestive, and highly motivational, focusing on positivity and empowerment. Remind them that every small step toward health is a victory, that they are stronger than they think, and that healing is a journey worth taking. Provide uplifting advice on self-care, mindset shifts, and small daily actions that can lead to improvement. Help them visualize a better future and encourage them to embrace the process of healing with confidence and hope.\n\n"
                + user_input
            ),
            max_tokens=150
        )
        output_text = response.choices[0].text.strip()
        print("Generated text:", output_text)  # Debugging line
        return jsonify({'output': output_text})
    except Exception as e:
        print("Error generating text:", e)  # Debugging line
        return jsonify({'error': str(e)}), 500
    
@app.route('/generate-audio', methods=['POST'])
def generate_audio():
    data = request.json
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'No text provided for audio generation'}), 400

    try:
        # Create a temporary file
        temp_dir = tempfile.gettempdir()
        audio_file = os.path.join(temp_dir, f"{uuid.uuid4()}.mp3")
        
        # Generate audio file
        tts = gTTS(text=text, lang='en')
        tts.save(audio_file)

        # Read the audio file and get the bytes
        with open(audio_file, 'rb') as f:
            audio_bytes = f.read()

        # Clean up the temporary file
        #os.remove(audio_file)

        # Return the audio file directly
        return send_file(
            io.BytesIO(audio_bytes),
            mimetype='audio/mp3',
            as_attachment=True,
            download_name='output.mp3'
        )
        os.remove(audio_file)
   
    except Exception as e:
        print(f"Error generating audio: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)