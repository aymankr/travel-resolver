import csv

def csv_to_city_array(csv_file_path, output_file_path):
    cities = set()  # Using a set to automatically remove duplicates
    
    with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        
        for row in csv_reader:
            stop_name = row['stop_name']
            if stop_name:
                # Split the name and take the first word, then convert to lowercase
                first_word = stop_name.split()[0].lower()
                cities.add(first_word)
    
    # Sort the cities alphabetically
    sorted_cities = sorted(cities)
    
    # Write the cities to a text file in the specified format
    with open(output_file_path, 'w', encoding='utf-8') as f:
        f.write("cities = [\n")
        for city in sorted_cities:
            f.write(f'    "{city}",\n')
        f.write("]\n")

# File paths
input_csv_path = 'stops.txt'  # Path to your input CSV file
output_txt_path = 'cities_array.txt'  # Path for the output text file

# Convert CSV to city array and write to file
csv_to_city_array(input_csv_path, output_txt_path)

print(f"Text file '{output_txt_path}' has been created with the array of cities.")